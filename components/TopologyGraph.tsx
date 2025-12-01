import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import { TreeNode, NodeGroup } from '../types';

interface TopologyGraphProps {
  data: TreeNode | null;
  groups?: NodeGroup[];
  onNodeClick: (node: TreeNode) => void;
}

const TopologyGraph: React.FC<TopologyGraphProps> = ({ data, groups = [], onNodeClick }) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setDimensions({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!data || !svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove(); // Clear previous render

    const { width, height } = dimensions;
    const margin = { top: 40, right: 120, bottom: 40, left: 120 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.1, 4])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Tree layout
    const nodeCount = d3.hierarchy(data).descendants().length;
    const dynamicHeight = Math.max(innerHeight, nodeCount * 45); 
    
    const treeMap = d3.tree<TreeNode>().size([dynamicHeight, innerWidth]);
    const hierarchy = d3.hierarchy(data);
    const root = treeMap(hierarchy);

    // Links
    g.selectAll('.link')
      .data(root.links())
      .enter()
      .append('path')
      .attr('class', 'link')
      .attr('d', d3.linkHorizontal<d3.HierarchyPointLink<TreeNode>, d3.HierarchyPointNode<TreeNode>>()
        .x(d => d.y)
        .y(d => d.x)
      )
      .attr('fill', 'none')
      .attr('stroke', '#cbd5e1')
      .attr('stroke-width', 2);

    // Nodes
    const nodes = g.selectAll('.node')
      .data(root.descendants())
      .enter()
      .append('g')
      .attr('class', 'node')
      .attr('transform', d => `translate(${d.y},${d.x})`)
      .style('cursor', 'pointer')
      .on('click', (event, d) => {
        event.stopPropagation();
        onNodeClick(d.data);
      });

    // Helper to find group color
    const getFillColor = (d: d3.HierarchyPointNode<TreeNode>) => {
        const nodeTeiDec = d.data.attributes.teiDec;
        
        // Check if node belongs to a group based on TEI comparison
        // We compare using decimal values to handle formatting differences (0x10 vs 0x010)
        const group = groups.find(g => g.teis.some(t => {
            const cleanT = t.trim();
            if (!cleanT) return false;
            // Parse as hex (radix 16) to support "0x10", "10", "0x010" equally
            const groupTeiDec = parseInt(cleanT, 16);
            return !isNaN(groupTeiDec) && groupTeiDec === nodeTeiDec;
        }));

        if (group) return group.color;

        // Default Logic
        if (d.data.attributes.teiDec === 1 || d.data.attributes.index === 0) return '#ef4444'; // Root: Red
        if (d.children && d.children.length > 0) return '#3b82f6'; // PCO: Blue
        return '#10b981'; // STA: Green
    };

    // Node Circles
    nodes.append('circle')
      .attr('r', 10)
      .attr('fill', d => getFillColor(d))
      .attr('stroke', '#fff')
      .attr('stroke-width', 2);

    // Labels
    nodes.append('text')
      .attr('dy', '.35em')
      .attr('x', d => d.children ? -15 : 15)
      .attr('text-anchor', d => d.children ? 'end' : 'start')
      .text(d => d.data.attributes.tei)
      .style('font-size', '12px')
      .style('fill', '#334155')
      .style('font-weight', '500')
      .style('pointer-events', 'none')
      .style('text-shadow', '0 1px 0 #fff, 1px 0 0 #fff, 0 -1px 0 #fff, -1px 0 0 #fff');

    // Add MAC address as subtitle
    nodes.append('text')
      .attr('dy', '1.4em')
      .attr('x', d => d.children ? -15 : 15)
      .attr('text-anchor', d => d.children ? 'end' : 'start')
      .text(d => d.data.attributes.mac)
      .style('font-size', '9px')
      .style('fill', '#94a3b8')
      .style('pointer-events', 'none');

    // Initial Zoom
    const initialTransform = d3.zoomIdentity.translate(margin.left, margin.top);
    svg.call(zoom.transform, initialTransform);

  }, [data, dimensions, onNodeClick, groups]);

  if (!data) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400">
        Waiting for data...
      </div>
    );
  }

  return (
    <div ref={containerRef} className="w-full h-full bg-white rounded-lg shadow-inner overflow-hidden relative">
      <svg ref={svgRef} width="100%" height="100%" className="touch-pan-x touch-pan-y"></svg>
      
      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/90 p-3 rounded shadow text-xs text-slate-600 backdrop-blur-sm border border-slate-100 max-w-xs overflow-y-auto max-h-40">
        <div className="font-semibold mb-2 text-slate-700">Legend</div>
        <div className="flex items-center gap-2 mb-1"><span className="w-3 h-3 rounded-full bg-red-500"></span> CCO (Root)</div>
        <div className="flex items-center gap-2 mb-1"><span className="w-3 h-3 rounded-full bg-blue-500"></span> PCO (Intermediate)</div>
        <div className="flex items-center gap-2 mb-1"><span className="w-3 h-3 rounded-full bg-green-500"></span> STA (Leaf)</div>
        
        {groups.length > 0 && (
            <>
                <div className="border-t border-slate-200 my-2"></div>
                <div className="font-semibold mb-2 text-slate-700">Groups</div>
                {groups.map(g => (
                    <div key={g.id} className="flex items-center gap-2 mb-1">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: g.color }}></span> 
                        <span className="truncate">{g.name}</span>
                    </div>
                ))}
            </>
        )}
      </div>
    </div>
  );
};

export default TopologyGraph;