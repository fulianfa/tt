export interface RawNodeData {
  index: number;
  mac: string;
  tei: string; // Keep as string hex "0x..."
  teiDec: number; // Parsed decimal
  role: string; // (O) etc
  ro: number;
  pco: string; // Hex string "032"
  pcoDec: number; // Parsed decimal for parent linkage
  level: number;
  nxh: string;
  rssi: number;
  snr: number;
  rawLine: string;
}

export interface TreeNode {
  name: string; // Usually TEI or MAC
  attributes: RawNodeData;
  children: TreeNode[];
}

export interface NodeGroup {
  id: string;
  name: string;
  color: string;
  teis: string[]; // List of TEIs in this group
}

export enum NodeType {
  CCO = 'CCO',
  PCO = 'PCO',
  STA = 'STA',
}

export interface ParseResult {
  nodes: RawNodeData[];
  root: TreeNode | null;
  error?: string;
}