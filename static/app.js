(function () {
  const API = '';
  const valueInput = document.getElementById('value-input');
  const btnInsert = document.getElementById('btn-insert');
  const btnDelete = document.getElementById('btn-delete');
  const btnClear = document.getElementById('btn-clear');
  const messageEl = document.getElementById('message');
  const sizeEl = document.getElementById('size');
  const treeSvg = document.getElementById('tree-svg');

  const NODE_R = 28;
  const LEVEL_DY = 100;
  const HORIZONTAL_SPACING = 80;
  const MIN_WIDTH = 400;

  function setMessage(text, type) {
    messageEl.textContent = text;
    messageEl.className = 'message' + (type ? ' ' + type : '');
  }

  function setSize(n) {
    sizeEl.textContent = String(n);
  }

  function getTree() {
    return fetch(API + '/api/tree')
      .then(r => r.json())
      .then(data => {
        setSize(data.size ?? 0);
        return data.tree;
      });
  }

  function post(endpoint, value) {
    return fetch(API + endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value: value })
    }).then(r => r.json());
  }

  function postClear() {
    return fetch(API + '/api/clear', { method: 'POST' }).then(r => r.json());
  }

  function getTreeHeight(node) {
    if (!node) return 0;
    return 1 + Math.max(getTreeHeight(node.left), getTreeHeight(node.right));
  }

  function countNodes(node) {
    if (!node) return 0;
    return 1 + countNodes(node.left) + countNodes(node.right);
  }

  function assignPositions(node, x, y, level) {
    if (!node) return { width: 0, nextX: x };
    
    node.y = y;
    
    const leftResult = assignPositions(node.left, x, y + LEVEL_DY, level + 1);
    const leftWidth = leftResult.width;
    const leftNextX = leftResult.nextX;
    
    let nodeX;
    if (leftWidth > 0) {
      nodeX = leftNextX - leftWidth / 2;
    } else {
      nodeX = x;
    }
    node.x = nodeX;
    
    const rightStartX = leftWidth > 0 ? leftNextX : (nodeX + HORIZONTAL_SPACING);
    const rightResult = assignPositions(node.right, rightStartX, y + LEVEL_DY, level + 1);
    const rightWidth = rightResult.width;
    const rightNextX = rightResult.nextX;
    
    const totalWidth = Math.max(leftWidth + rightWidth, HORIZONTAL_SPACING);
    const nextX = rightWidth > 0 ? Math.max(rightNextX, rightStartX + rightWidth) : (leftWidth > 0 ? leftNextX + HORIZONTAL_SPACING : nodeX + HORIZONTAL_SPACING);
    
    return { width: totalWidth, nextX: nextX };
  }

  function layoutTree(root) {
    if (!root) return null;
    
    const height = getTreeHeight(root);
    assignPositions(root, 0, 0, 0);
    const totalHeight = height * LEVEL_DY;
    
    const minX = findMinX(root);
    const maxX = findMaxX(root);
    
    if (minX === Infinity || maxX === -Infinity || isNaN(minX) || isNaN(maxX)) {
      console.error('Invalid coordinates after assignPositions', { minX, maxX, root });
      return null;
    }
    
    const actualWidth = maxX - minX;
    const centerOffset = actualWidth > 0 ? -minX - actualWidth / 2 : 0;
    
    shiftTree(root, centerOffset);
    
    const finalMinX = findMinX(root);
    const finalMaxX = findMaxX(root);
    
    if (finalMinX === Infinity || finalMaxX === -Infinity || isNaN(finalMinX) || isNaN(finalMaxX)) {
      console.error('Invalid coordinates after shift', { finalMinX, finalMaxX, root });
      return null;
    }
    
    const finalWidth = Math.max(finalMaxX - finalMinX + 2 * NODE_R, MIN_WIDTH);
    
    return {
      root,
      width: finalWidth,
      height: totalHeight,
      minX: finalMinX - NODE_R,
      maxX: finalMaxX + NODE_R
    };
  }

  function findMinX(node) {
    if (!node) return Infinity;
    const x = node.x !== undefined ? node.x : Infinity;
    return Math.min(x, findMinX(node.left), findMinX(node.right));
  }

  function findMaxX(node) {
    if (!node) return -Infinity;
    const x = node.x !== undefined ? node.x : -Infinity;
    return Math.max(x, findMaxX(node.left), findMaxX(node.right));
  }

  function shiftTree(node, offset) {
    if (!node) return;
    node.x += offset;
    shiftTree(node.left, offset);
    shiftTree(node.right, offset);
  }

  function renderEdge(parent, child, container) {
    if (!parent || !child) return;
    const dx = child.x - parent.x;
    const dy = child.y - parent.y;
    const dist = Math.hypot(dx, dy);
    if (dist === 0) return;
    
    const startOffset = NODE_R;
    const endOffset = NODE_R;
    const startX = parent.x + (dx / dist) * startOffset;
    const startY = parent.y + (dy / dist) * startOffset;
    const endX = child.x - (dx / dist) * endOffset;
    const endY = child.y - (dy / dist) * endOffset;
    
    const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('class', 'edge-line');
    line.setAttribute('x1', startX);
    line.setAttribute('y1', startY);
    line.setAttribute('x2', endX);
    line.setAttribute('y2', endY);
    container.appendChild(line);
  }

  function renderEdges(node, container) {
    if (!node) return;
    if (node.left) {
      renderEdge(node, node.left, container);
      renderEdges(node.left, container);
    }
    if (node.right) {
      renderEdge(node, node.right, container);
      renderEdges(node.right, container);
    }
  }

  function renderNodes(node, highlightValue, container) {
    if (!node) return;
    const highlight = highlightValue !== undefined && node.value === highlightValue ? ' highlight' : '';
    
    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.setAttribute('class', 'node');
    group.setAttribute('data-value', node.value);
    
    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('class', 'node-circle' + highlight);
    circle.setAttribute('r', NODE_R);
    circle.setAttribute('cx', node.x);
    circle.setAttribute('cy', node.y);
    group.appendChild(circle);
    
    const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    text.setAttribute('class', 'node-text');
    text.setAttribute('x', node.x);
    text.setAttribute('y', node.y);
    text.textContent = node.value;
    group.appendChild(text);
    
    container.appendChild(group);
    
    if (node.left) renderNodes(node.left, highlightValue, container);
    if (node.right) renderNodes(node.right, highlightValue, container);
  }

  function render(tree, highlightValue) {
    try {
      treeSvg.innerHTML = '';
      if (!tree) {
        const empty = document.createElement('text');
        empty.setAttribute('class', 'empty-state');
        empty.setAttribute('x', '50%');
        empty.setAttribute('y', '50%');
        empty.setAttribute('text-anchor', 'middle');
        empty.setAttribute('dominant-baseline', 'middle');
        empty.textContent = 'Tree is empty. Insert a value.';
        treeSvg.appendChild(empty);
        treeSvg.setAttribute('viewBox', '0 0 400 120');
        treeSvg.setAttribute('width', '100%');
        treeSvg.setAttribute('height', '400');
        return;
      }
      
      console.log('Rendering tree:', tree);
      const treeCopy = JSON.parse(JSON.stringify(tree));
      const layout = layoutTree(treeCopy);
      console.log('Layout result:', layout);
      
      if (!layout || !layout.root) {
        console.error('Layout failed', layout);
        return;
      }
      
      const padding = NODE_R + 40;
      const finalMinX = layout.minX;
      const finalMaxX = layout.maxX;
      const finalMinY = 0;
      const finalMaxY = layout.height;
      
      const viewBoxX = finalMinX - padding;
      const viewBoxY = finalMinY - padding;
      const viewBoxWidth = (finalMaxX - finalMinX) + 2 * padding;
      const viewBoxHeight = finalMaxY + 2 * padding;
      
      console.log('ViewBox calculation:', { finalMinX, finalMaxX, viewBoxX, viewBoxY, viewBoxWidth, viewBoxHeight });
      
      if (isNaN(viewBoxX) || isNaN(viewBoxY) || isNaN(viewBoxWidth) || isNaN(viewBoxHeight) ||
          viewBoxWidth <= 0 || viewBoxHeight <= 0) {
        console.error('Invalid viewBox values', { viewBoxX, viewBoxY, viewBoxWidth, viewBoxHeight, layout });
        return;
      }
      
      treeSvg.setAttribute('viewBox', `${viewBoxX} ${viewBoxY} ${viewBoxWidth} ${viewBoxHeight}`);
      treeSvg.setAttribute('width', '100%');
      treeSvg.setAttribute('height', Math.max(viewBoxHeight, 400));
      
      console.log('Node coordinates:', {
        root: { x: layout.root.x, y: layout.root.y, value: layout.root.value },
        left: layout.root.left ? { x: layout.root.left.x, y: layout.root.left.y, value: layout.root.left.value } : null,
        right: layout.root.right ? { x: layout.root.right.x, y: layout.root.right.y, value: layout.root.right.value } : null
      });
      
      const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      renderEdges(layout.root, g);
      renderNodes(layout.root, highlightValue, g);
      
      treeSvg.appendChild(g);
      
      console.log('SVG element:', {
        viewBox: treeSvg.getAttribute('viewBox'),
        width: treeSvg.getAttribute('width'),
        height: treeSvg.getAttribute('height'),
        childrenCount: treeSvg.children.length,
        edgesCount: g.querySelectorAll('line').length,
        nodesCount: g.querySelectorAll('circle').length
      });
      console.log('Tree rendered successfully');
    } catch (error) {
      console.error('Render error:', error, error.stack);
      setMessage('Error rendering tree: ' + error.message, 'error');
    }
  }

  function parseInput() {
    const raw = valueInput.value.trim();
    if (raw === '') return null;
    const n = parseInt(raw, 10);
    if (!Number.isInteger(n)) return null;
    return n;
  }

  function refresh(highlightValue) {
    getTree().then(tree => render(tree, highlightValue));
  }

  btnInsert.addEventListener('click', function () {
    const v = parseInput();
    if (v === null) {
      setMessage('Enter an integer.', 'error');
      return;
    }
    post('/api/insert', v).then(data => {
      setMessage(data.message || 'Inserted.');
      setSize(data.size);
      render(data.tree, v);
      valueInput.value = '';
    }).catch(() => {
      setMessage('Request failed.', 'error');
    });
  });

  btnDelete.addEventListener('click', function () {
    const v = parseInput();
    if (v === null) {
      setMessage('Enter an integer to delete.', 'error');
      return;
    }
    post('/api/delete', v).then(data => {
      setMessage(data.message || 'Done.');
      setSize(data.size);
      render(data.tree);
      valueInput.value = '';
    }).catch(() => {
      setMessage('Request failed.', 'error');
    });
  });

  btnClear.addEventListener('click', function () {
    postClear().then(data => {
      setMessage('Tree cleared.');
      setSize(0);
      render(null);
    }).catch(() => {
      setMessage('Request failed.', 'error');
    });
  });

  valueInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') btnInsert.click();
  });

  refresh();
})();
