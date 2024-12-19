import { useCallback } from 'react';
import { Handle, Position } from '@xyflow/react';
import ChordVisualizer from '../ChordVisualizer';

const handleStyle = { left: 10 };

function TextUpdaterNode({ data, isConnectable }) {
  const onChange = useCallback((evt) => {
    console.log(evt.target.value);
  }, []);

  const { chordSequence } = data;

  return (
    <div className="text-updater-node">
      <Handle
        type="target"
        position={Position.Left}
        isConnectable={isConnectable}
      />
      <Handle
        type="source"
        position={Position.Right}
        isConnectable={isConnectable}
      />
      <div>
        <ChordVisualizer chordSequence={chordSequence} onChange={onChange}/>
      </div>
    </div>
  );
}

export default TextUpdaterNode;
