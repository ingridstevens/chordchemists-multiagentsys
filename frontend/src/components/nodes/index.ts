import type { BuiltInNode, Node, NodeTypes } from '@xyflow/react';
import PositionLoggerNode, {
  type PositionLoggerNode as PositionLoggerNodeType,
} from './PositionLoggerNode';

import TextUpdaterNode from './TextUpdaterNode';



export const initialNodes = [
  
  /*
  {
    id: 'node-3',
    type: 'textUpdater',
    position: { x: 0, y: 0 },
    data: { value: 123, chordSequence: ['G7'] },
    style: { backgroundColor: "#ffffff", color: "white", borderColor: "white" }
  },
  */
  
] satisfies Node[];

export const nodeTypes = {
  'position-logger': PositionLoggerNode,
  textUpdater: TextUpdaterNode
  // Add any of your custom nodes here!
} satisfies NodeTypes;

// Append the types of you custom edges to the BuiltInNode type
export type CustomNodeType = BuiltInNode | PositionLoggerNodeType;
