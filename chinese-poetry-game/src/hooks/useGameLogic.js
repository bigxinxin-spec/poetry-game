import { useState, useCallback } from 'react';

export const useGameLogic = (initialPoem) => {
    const [selectedChars, setSelectedChars] = useState([]);
    const [correctChars, setCorrectChars] = useState('');
    
    const handleCharacterClick = useCallback((char, index) => {
        setSelectedChars(prev => {
            const newSelected = [...prev, { char, index }];
            
            // 将选中的字符连接成字符串
            const currentString = newSelected.map(item => item.char).join('');
            
            // 检查是否匹配诗句的开头部分
            if (initialPoem.content.startsWith(currentString)) {
                setCorrectChars(currentString);
                return newSelected;
            } else {
                // 如果不匹配，清空选择
                return [];
            }
        });
    }, [initialPoem]);

    return {
        selectedChars,
        correctChars,
        handleCharacterClick
    };
};