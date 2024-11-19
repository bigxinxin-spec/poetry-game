export const generateRandomGrid = (characters) => {
    const size = Math.ceil(Math.sqrt(characters.length));
    const shuffledChars = [...characters];
    
    // 创建网格
    const grid = [];
    let charIndex = 0;
    
    for (let i = 0; i < size; i++) {
        const row = [];
        for (let j = 0; j < size; j++) {
            if (charIndex < shuffledChars.length) {
                row.push({
                    char: shuffledChars[charIndex],
                    index: charIndex
                });
                charIndex++;
            } else {
                row.push(null);
            }
        }
        grid.push(row);
    }
    
    return grid;
};