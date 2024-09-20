"use client";
import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const algorithms = {
  bfs: {
    name: 'Breadth-First Search',
    description: 'Explores all vertices at the present depth before moving to vertices at the next depth level.',
    complexity: 'O(V + E) where V is the number of vertices and E is the number of edges.',
  },
  dfs: {
    name: 'Depth-First Search',
    description: 'Explores as far as possible along each branch before backtracking.',
    complexity: 'O(V + E) where V is the number of vertices and E is the number of edges.',
  },
  dijkstra: {
    name: "Dijkstra's Algorithm",
    description: 'Finds the shortest path between nodes in a graph.',
    complexity: 'O((V + E) log V) where V is the number of vertices and E is the number of edges.',
  },
};

const generateGraphData = (numNodes) => {
  const nodes = [...Array(numNodes)].map((_, i) => ({ 
    id: i, 
    label: `Node ${i}`,
    x: Math.random() * 700 + 50,
    y: Math.random() * 300 + 50
  }));
  const edges = [];
  for (let i = 0; i < numNodes; i++) {
    const numEdges = Math.floor(Math.random() * 3) + 1;
    for (let j = 0; j < numEdges; j++) {
      const target = Math.floor(Math.random() * numNodes);
      if (target !== i) {
        edges.push({ source: i, target, weight: Math.floor(Math.random() * 10) + 1 });
      }
    }
  }
  return { nodes, edges };
};

const GraphVisualization = ({ graph, visited, sourceNode, destNode, onNodeClick }) => {
  if (!graph || !graph.nodes || !graph.edges) {
    return <div>Error: Invalid graph data</div>;
  }

  return (
    <svg width="800" height="400" className="border border-gray-300 rounded-lg shadow-inner bg-gray-50">
      {graph.edges.map((edge, index) => {
        const sourceNode = graph.nodes[edge.source];
        const targetNode = graph.nodes[edge.target];
        if (!sourceNode || !targetNode) return null;

        const dx = targetNode.x - sourceNode.x;
        const dy = targetNode.y - sourceNode.y;
        const angle = Math.atan2(dy, dx);
        
        const startX = sourceNode.x + 20 * Math.cos(angle);
        const startY = sourceNode.y + 20 * Math.sin(angle);
        const endX = targetNode.x - 20 * Math.cos(angle);
        const endY = targetNode.y - 20 * Math.sin(angle);

        return (
          <line
            key={index}
            x1={startX}
            y1={startY}
            x2={endX}
            y2={endY}
            stroke="#888"
            strokeWidth="2"
          />
        );
      })}
      {graph.nodes.map((node) => (
        <g key={node.id} onClick={() => onNodeClick(node.id)} style={{cursor: 'pointer'}}>
          <circle
            cx={node.x}
            cy={node.y}
            r="20"
            fill={
              node.id === sourceNode ? "lightgreen" :
              node.id === destNode ? "lightcoral" :
              visited.includes(node.id) ? "lightblue" : "white"
            }
            stroke={
              node.id === sourceNode || node.id === destNode ? "black" : "#888"
            }
            strokeWidth="2"
          />
          <text
            x={node.x}
            y={node.y}
            textAnchor="middle"
            alignmentBaseline="middle"
            fontSize="12"
            fontWeight="bold"
            fill="#333"
          >
            {node.label}
          </text>
        </g>
      ))}
    </svg>
  );
};

const GraphAlgorithmPlatform = () => {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState('bfs');
  const [graph, setGraph] = useState(null);
  const [visited, setVisited] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [stepCount, setStepCount] = useState(0);
  const [sourceNode, setSourceNode] = useState(null);
  const [destNode, setDestNode] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      setGraph(generateGraphData(10));
    } catch (err) {
      setError("Error generating graph data");
      console.error(err);
    }
  }, []);

  const handleNodeClick = (nodeId) => {
    if (sourceNode === null) {
      setSourceNode(nodeId);
    } else if (destNode === null && nodeId !== sourceNode) {
      setDestNode(nodeId);
    }
  };

  const resetSelection = () => {
    setSourceNode(null);
    setDestNode(null);
    setVisited([]);
    setStepCount(0);
  };

  const runAlgorithm = () => {
    if (sourceNode === null || destNode === null) {
      setError("Please select both source and destination nodes.");
      return;
    }

    setIsRunning(true);
    setVisited([]);
    setStepCount(0);
    
    let queue = [sourceNode];
    let visited = new Set();
    
    const step = () => {
      if (queue.length === 0 || visited.has(destNode)) {
        setIsRunning(false);
        return;
      }
      
      const node = queue.shift();
      if (!visited.has(node)) {
        visited.add(node);
        setVisited([...visited]);
        setStepCount(prev => prev + 1);
        
        graph.edges
          .filter(edge => edge.source === node)
          .forEach(edge => queue.push(edge.target));
      }
      
      setTimeout(step, 1000);
    };
    
    step();
  };

  if (error) {
    return <div className="text-red-500">{error}</div>;
  }

  if (!graph) return <div>Loading...</div>;

  return (
    <div className="p-4 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Interactive Graph Algorithm Learning Platform</h1>
      
      <div className="mb-4">
        <Select value={selectedAlgorithm} onValueChange={setSelectedAlgorithm}>
          <SelectTrigger>
            <SelectValue placeholder="Select an algorithm" />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(algorithms).map(([key, { name }]) => (
              <SelectItem key={key} value={key}>{name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>{algorithms[selectedAlgorithm].name}</AlertTitle>
        <AlertDescription>
          {algorithms[selectedAlgorithm].description}
          <br />
          Time Complexity: {algorithms[selectedAlgorithm].complexity}
        </AlertDescription>
      </Alert>
      
      <div className="my-4">
        <GraphVisualization 
          graph={graph} 
          visited={visited} 
          sourceNode={sourceNode} 
          destNode={destNode}
          onNodeClick={handleNodeClick}
        />
      </div>

      <div className="flex justify-between mb-4">
        <Button onClick={runAlgorithm} disabled={isRunning || sourceNode === null || destNode === null}>
          {isRunning ? 'Running...' : 'Run Algorithm'}
        </Button>
        <Button onClick={resetSelection} variant="outline">
          Reset Selection
        </Button>
      </div>
      
      <div className="mb-4">
        <h2 className="text-xl font-semibold">Algorithm Progress</h2>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={[{ step: stepCount, visited: visited.length }]}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="step" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="visited" stroke="#8884d8" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default GraphAlgorithmPlatform;
