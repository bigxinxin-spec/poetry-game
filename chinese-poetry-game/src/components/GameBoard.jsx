import { useState } from 'react';
import { Card } from 'antd';
import CharacterGrid from './CharacterGrid';
import '../styles/GameBoard.css';

const GameBoard = () => {
    const [currentPoem] = useState({
        title: '春晓',
        author: '孟浩然',
        content: '春眠不觉晓，处处闻啼鸟。',
        characters: ['春', '眠', '不', '觉', '晓', '处', '处', '闻', '啼', '鸟']
    });

    return (
        <Card className="game-board">
            <div className="poem-info">
                <h2>{currentPoem.title}</h2>
                <p>作者：{currentPoem.author}</p>
            </div>
            <CharacterGrid 
                characters={currentPoem.characters}
                correctOrder={currentPoem.content}
            />
        </Card>
    );
};

export default GameBoard;