import { useState, useRef, useEffect } from 'react';
import { message } from 'antd';
import { generateRandomGrid } from '../utils/helpers';
import '../styles/CharacterGrid.css';

const CharacterGrid = ({ characters, correctOrder }) => {
    const [grid, setGrid] = useState(() => generateRandomGrid(characters));
    const [lines, setLines] = useState([]);
    const [currentLine, setCurrentLine] = useState(null);
    const [selectedChars, setSelectedChars] = useState([]);
    const gridRef = useRef(null);
    const cellRefs = useRef({});

    useEffect(() => {
        setGrid(generateRandomGrid(characters));
    }, [characters]);

    const getCharPosition = (element) => {
        const rect = element.getBoundingClientRect();
        const gridRect = gridRef.current.getBoundingClientRect();
        return {
            x: rect.left + rect.width / 2 - gridRect.left,
            y: rect.top + rect.height / 2 - gridRect.top
        };
    };

    const isPointNearLine = (point, lineStart, lineEnd) => {
        const lineLength = Math.sqrt(
            Math.pow(lineEnd.x - lineStart.x, 2) + 
            Math.pow(lineEnd.y - lineStart.y, 2)
        );
        
        if (lineLength === 0) return false;

        const distance = Math.abs(
            (lineEnd.y - lineStart.y) * point.x -
            (lineEnd.x - lineStart.x) * point.y +
            lineEnd.x * lineStart.y -
            lineEnd.y * lineStart.x
        ) / lineLength;

        const dot = (
            (point.x - lineStart.x) * (lineEnd.x - lineStart.x) +
            (point.y - lineStart.y) * (lineEnd.y - lineStart.y)
        ) / Math.pow(lineLength, 2);

        return distance < 30 && dot >= 0 && dot <= 1;
    };

    const checkPathCollision = (start, end, excludePoints) => {
        for (const [key, element] of Object.entries(cellRefs.current)) {
            if (!element || excludePoints.includes(key)) continue;

            const rect = element.getBoundingClientRect();
            const gridRect = gridRef.current.getBoundingClientRect();
            const charCenter = {
                x: rect.left + rect.width / 2 - gridRect.left,
                y: rect.top + rect.height / 2 - gridRect.top
            };

            if (isPointNearLine(charCenter, start, end)) {
                return true;
            }
        }
        return false;
    };

    const findClosestChar = (x, y) => {
        const gridRect = gridRef.current.getBoundingClientRect();
        const touchX = x - gridRect.left;
        const touchY = y - gridRect.top;
        
        let closest = null;
        let minDistance = Infinity;

        Object.entries(cellRefs.current).forEach(([key, element]) => {
            if (!element) return;
            const rect = element.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2 - gridRect.left;
            const centerY = rect.top + rect.height / 2 - gridRect.top;
            
            const distance = Math.sqrt(
                Math.pow(touchX - centerX, 2) + 
                Math.pow(touchY - centerY, 2)
            );

            if (distance < 50 && distance < minDistance) {
                minDistance = distance;
                closest = {
                    key: key,
                    position: { x: centerX, y: centerY }
                };
            }
        });

        return closest;
    };

    const handleTouchStart = (e, cell, rowIndex, colIndex) => {
        e.preventDefault();
        if (!cell) return;
        
        const element = e.currentTarget;
        const pos = getCharPosition(element);
        
        setSelectedChars([{ ...cell, rowIndex, colIndex }]);
        setCurrentLine({
            start: pos,
            end: pos,
            isValid: true
        });
    };

    const handleTouchMove = (e) => {
        if (!currentLine) return;
        
        const touch = e.touches[0];
        const closest = findClosestChar(touch.clientX, touch.clientY);
        
        if (closest) {
            const [rowIndex, colIndex] = closest.key.split('-').map(Number);
            const cell = grid[rowIndex][colIndex];
            
            if (cell && !selectedChars.some(c => 
                c.rowIndex === rowIndex && c.colIndex === colIndex
            )) {
                const lastSelected = selectedChars[selectedChars.length - 1];
                const lastPos = getCharPosition(
                    cellRefs.current[`${lastSelected.rowIndex}-${lastSelected.colIndex}`]
                );
                const newPos = getCharPosition(
                    cellRefs.current[`${rowIndex}-${colIndex}`]
                );

                const hasCollision = checkPathCollision(
                    lastPos,
                    newPos,
                    [`${lastSelected.rowIndex}-${lastSelected.colIndex}`, `${rowIndex}-${colIndex}`]
                );

                if (!hasCollision) {
                    const newSelected = [...selectedChars, { ...cell, rowIndex, colIndex }];
                    setSelectedChars(newSelected);
                    setCurrentLine(prev => ({
                        ...prev,
                        end: closest.position,
                        isValid: true
                    }));
                }
            }
        }

        const gridRect = gridRef.current.getBoundingClientRect();
        setCurrentLine(prev => ({
            ...prev,
            end: {
                x: touch.clientX - gridRect.left,
                y: touch.clientY - gridRect.top
            }
        }));
    };

    const handleTouchEnd = () => {
        if (selectedChars.length > 0) {
            const selectedString = selectedChars.map(item => item.char).join('');
            const isValid = correctOrder.includes(selectedString) && 
                          correctOrder.indexOf(selectedString) === 0;

            const newLine = {
                ...currentLine,
                isValid,
                points: selectedChars.map(char => {
                    const element = cellRefs.current[`${char.rowIndex}-${char.colIndex}`];
                    return getCharPosition(element);
                })
            };
            
            setLines(prev => [...prev, newLine]);
            
            if (!isValid) {
                message.error('连接顺序不正确');
                setTimeout(() => {
                    setLines(prev => prev.slice(0, -1));
                    setSelectedChars([]);
                }, 1000);
            }
        }
        setCurrentLine(null);
    };

    const renderArrow = (start, end) => {
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        const angle = Math.atan2(dy, dx);
        const length = 10;
        
        const arrowHead = {
            x1: end.x - length * Math.cos(angle - Math.PI / 6),
            y1: end.y - length * Math.sin(angle - Math.PI / 6),
            x2: end.x,
            y2: end.y,
            x3: end.x - length * Math.cos(angle + Math.PI / 6),
            y3: end.y - length * Math.sin(angle + Math.PI / 6)
        };

        return (
            <polygon 
                points={`${arrowHead.x1},${arrowHead.y1} ${arrowHead.x2},${arrowHead.y2} ${arrowHead.x3},${arrowHead.y3}`}
                className={`arrow-head ${currentLine?.isValid ? 'valid' : 'invalid'}`}
            />
        );
    };

    return (
        <div 
            className={`character-grid grid-${grid.length}x${grid[0].length}`} 
            ref={gridRef}
        >
            {grid.map((row, rowIndex) => (
                <div key={rowIndex} className="grid-row">
                    {row.map((cell, colIndex) => {
                        const isSelected = selectedChars.some(
                            c => c.rowIndex === rowIndex && c.colIndex === colIndex
                        );
                        return cell ? (
                            <div
                                key={`${rowIndex}-${colIndex}`}
                                ref={el => cellRefs.current[`${rowIndex}-${colIndex}`] = el}
                                className={`grid-cell ${isSelected ? 'selected' : ''}`}
                                onTouchStart={(e) => handleTouchStart(e, cell, rowIndex, colIndex)}
                                onTouchMove={handleTouchMove}
                                onTouchEnd={handleTouchEnd}
                            >
                                {cell.char}
                            </div>
                        ) : null;
                    })}
                </div>
            ))}
            <svg className="lines-container">
                {lines.map((line, index) => (
                    <g key={index}>
                        {line.points?.map((point, i) => {
                            if (i === line.points.length - 1) return null;
                            return (
                                <g key={i}>
                                    <line
                                        x1={point.x}
                                        y1={point.y}
                                        x2={line.points[i + 1].x}
                                        y2={line.points[i + 1].y}
                                        className={`connection-line ${line.isValid ? 'valid' : 'invalid'}`}
                                    />
                                    {renderArrow(point, line.points[i + 1])}
                                </g>
                            );
                        })}
                    </g>
                ))}
                {currentLine && (
                    <g>
                        <line
                            x1={currentLine.start.x}
                            y1={currentLine.start.y}
                            x2={currentLine.end.x}
                            y2={currentLine.end.y}
                            className={`connection-line current ${currentLine.isValid ? 'valid' : 'invalid'}`}
                        />
                        {renderArrow(currentLine.start, currentLine.end)}
                    </g>
                )}
            </svg>
        </div>
    );
};

export default CharacterGrid;