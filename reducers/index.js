
import Block from './Block'

const initialState = {
    tableData:[],
    moveBlock:{
        num : 0,    //블록번호
        rotate: 0, //회전정도
        pos: [0,0], //좌상단의 좌표  
    },
    stopBlock:[],
    nextBlock: true,
    isGameStart: false,
    eraseRow: new Set(),
};

const row = 12;
const col = 8;

const deep2Dcopy = (arr) => [...arr.map((v) => [...v])];

const drawblock = (stopBlock, moveBlock) => {

    const result = deep2Dcopy(stopBlock);
    const {pos, num, rotate} = moveBlock;
    const block = Block[num][rotate];

    for (let i = 0; i<block.length; i++){
        for(let j = 0; j<block[0].length; j++){

            if(block[i][j] !== 0) {
                if(result[i+pos[0]][j+pos[1]] === 0){
                    result[i+pos[0]][j+pos[1]] = block[i][j];
                } else { //블록 끼리 겹침
                    return false;
                }
            }

        }
    }
    return result;
    
}

const eraseblock = (block) => {

    for(let i = row-1; i >= 0; i--){
        if(block[i].every((v) => v > 0)){
            //console.log(block)
            //console.log('한줄삭제')
            block.splice(i,1);
            block.unshift(Array(col).fill(0));
        }
    }


}

const reducer = (state = initialState,action) => {

    const stopBlock = state.stopBlock;
    let moveBlock;
    let draw;

    const { pos, num, rotate } = state.moveBlock;
    const empty_table = () => Array.from(Array(row), () => new Array(col).fill(0));
   
    switch(action.type) {

        case 'GAME_START':
            return {
                ...state,
                tableData: empty_table(),
                moveBlock:{},
                stopBlock: empty_table(),
                isGameStart:true,
            }

        case 'CREATE_BLOCK':
            moveBlock = {
                //num : Math.floor(Math.random() * Block.length),
                num : 1,
                rotate: 0,
                pos: [0,Math.floor(col/2)-1],
            };

            return { 
                ...state,
                moveBlock,
                nextBlock: false,
                tableData:drawblock(stopBlock, moveBlock),
            }
        case 'MOVE_DOWN':

            //바닥에 닿았을때
            if (pos[0] >= row - Block[num][rotate].length) {

                //eraseblock(state.tableData)
                return { 
                    ...state,
                    nextBlock: true,
                    stopBlock:deep2Dcopy(state.tableData),
                }
            }

            moveBlock = {
                ...state.moveBlock,
                pos: [pos[0]+1,pos[1]],
            };

            draw = drawblock(stopBlock, moveBlock);

            if(draw) {
                return {
                    ...state,
                    moveBlock,
                    tableData: [...draw],
                }
            } else { 
                //eraseblock(state.tableData)

                return {
                    ...state,
                    nextBlock: true,
                    stopBlock:deep2Dcopy(state.tableData),
                }
            }


        case 'MOVE_LEFT_OR_RIGHT':

            let newPos;
            if(action.dir === 'LEFT')
                newPos = [pos[0],pos[1]-1];
            else
                newPos = [pos[0],pos[1]+1];


            moveBlock = {
                ...state.moveBlock,
                pos: newPos,
            };

            draw = drawblock(stopBlock, moveBlock);

            if(draw) {
                return {
                    ...state,
                    moveBlock,
                    tableData: [...draw],
                }
            } else {
                return {
                    ...state,
                }
            }

        case 'MOVE_ROTATE':

            moveBlock = {
                ...state.moveBlock,
                rotate: (rotate + 1) % Block[num].length,
            };

            draw = drawblock(stopBlock, moveBlock);

            if(draw) {
                return {
                    ...state,
                    moveBlock,
                    tableData: draw,
                }
            } else {
                return {
                    ...state,
                }
            }
        case 'IS_NEED_ERASE':

            let eraseRow = state.eraseRow;
            
            for(let i = row-1; i >= 0; i--){
                if(stopBlock[i].every((v) => v > 0)){
                    //stopBlock.splice(i,1);
                    //stopBlock.unshift([...Array(col).fill(0)]);
                    //console.log(stopBlock)
                    eraseRow.add(i);
                }
            }

            return {
                ...state,
                eraseRow
            }

        case 'ERASE_BLOCK':

            const empty = Array(state.eraseRow.size).fill(Array(col).fill(0));
            const result = empty.concat(stopBlock.filter((arr,i) => !state.eraseRow.has(i)));

            return {
                ...state,
                stopBlock: deep2Dcopy(result),
                eraseRow: new Set(),
            }

        default:
            return state;
    }
} 

export default reducer;