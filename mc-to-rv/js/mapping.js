const OPCODE_TO_TYPE = {
  '0000011': 'I',
  '0010011': 'I',
  '0010111': 'U',
  '0100011': 'S',
  '0110011': 'R',
  '0110111': 'U',
  '1100011': 'B',
  '1100111': 'I',
  '1101111': 'J',
  '1110011': 'I',
  '0110011': 'R',
  '1010011': 'R',
  '0000111': 'I',
  '1010011': 'R',
  '0100111': 'S',
  '1110011': 'R'
}

/*
 * type: (instruction) => [rd, rs1, rs2, funct3, funct7, imm]
 */
const TYPE_PARSE = {
  'R': i => ([i.slice(20, 25), i.slice(12, 17), i.slice(7, 12), i.slice(17, 20), i.slice(0, 7), undefined]),
  'I': i => ([i.slice(20, 25), i.slice(12, 17), undefined     , i.slice(17, 20), undefined    , i[0].repeat(20) + i.slice(1, 12)]),
  'S': i => ([undefined      , i.slice(12, 17), i.slice(7, 12), i.slice(17, 20), undefined    , i[0].repeat(20) + i.slice(1, 7) + i.slice(20, 25)]),
  'J': i => ([i.slice(20, 25), undefined      , undefined     , undefined      , undefined    , i[0].repeat(12) + i.slice(12, 20) + i[11] + i.slice(1, 11) + '0']),
  'B': i => ([undefined      , i.slice(12, 17), i.slice(7, 12), i.slice(17, 20), undefined    , i[0].repeat(20) + i[24] + i.slice(1, 7) + i.slice(20, 24) + '0']),
  'U': i => ([i.slice(20, 25), undefined      , undefined     , undefined      , undefined    , i.slice(0, 20)])
}

/*
 * xi
 */
const REGISTERS = [
  'zero', 'ra', 'sp' , 'gp' , 'tp', 't0', 't1', 't2',
  's0'  , 's1', 'a0' , 'a1' , 'a2', 'a3', 'a4', 'a5',
  'a6'  , 'a7', 's2' , 's3' , 's4', 's5', 's6', 's7',
  's8'  , 's9', 's10', 's11', 't3', 't4', 't5', 't6'
]

/*
 * 'opcode + funct3 + funct7': 'syntax'
 */
const SYNTAX = {
  '00000110000000000': 'lb rd,imm(rs1)',
  '00000110010000000': 'lh rd,imm(rs1)',
  '00000110100000000': 'lw rd,imm(rs1)',
  '00000111000000000': 'lbu rd,imm(rs1)',
  '00000111010000000': 'lhu rd,imm(rs1)',
  '00100110000000000': 'addi rd,rs1,imm',
  '00100110010000000': 'slli rd,rs1,imm',
  '00100110100000000': 'slti rd,rs1,imm',
  '00100110110000000': 'sltiu rd,rs1,imm',
  '00100111000000000': 'xori rd,rs1,imm',
  '00100111010000000': 'srli rd,rs1,imm',
  '00100111010100000': 'srai rd,rs1,imm',
  '00100111100000000': 'ori rd,rs1,imm',
  '00100111110000000': 'andi rd,rs1,imm',
  '00101110000000000': 'auipc rd,imm',
  '01000110000000000': 'sb rs2,imm(rs1)',
  '01000110010000000': 'sh rs2,imm(rs1)',
  '01000110100000000': 'sw rs2,imm(rs1)',
  '01100110000000000': 'add rd,rs1,rs2',
  '01100110000100000': 'sub rd,rs1,rs2',
  '01100110010000000': 'sll rd,rs1,rs2',
  '01100110100000000': 'slt rd,rs1,rs2',
  '01100110110000000': 'sltu rd,rs1,rs2 ',
  '01100111000000000': 'xor rd,rs1,rs2',
  '01100111010000000': 'srl rd,rs1,rs2',
  '01100111010100000': 'sra rd,rs1,rs2',
  '01100111100000000': 'or rd,rs1,rs2',
  '01100111110000000': 'and rd,rs1,rs2',
  '01101110000000000': 'lui rd,imm',
  '11000110000000000': 'beq rs1,rs2,imm',
  '11000110010000000': 'bne rs1,rs2,imm',
  '11000111000000000': 'blt rs1,rs2,imm',
  '11000111010000000': 'bge rs1,rs2,imm',
  '11000111100000000': 'bltu rs1,rs2,imm',
  '11000111110000000': 'bgeu rs1,rs2,imm',
  '11001110000000000': 'jalr rd,rs1,imm',
  '11011110000000000': 'jal rd,imm',
  '11100110000000000': 'ecall',
  '11100110010000000': 'csrrw rd,CSR,rs1',
  '11100110100000000': 'csrrs rd,CSR,rs1',
  '11100110110000000': 'csrrc rd,CSR,rs1',
  '11100111010000000': 'csrrwi rd,CSR,imm',
  '11100111100000000': 'csrrsi rd,CSR,imm',
  '11100111110000000': 'csrrci rd,CSR,imm',
  '01100110000000001': 'mul rd,rs1,rs2',
  '01100110010000001': 'mulh rd,rs1,rs2',
  '01100110100000001': 'mulhsu rd,rs1,rs2',
  '01100110110000001': 'mulhu rd,rs1,rs2',
  '01100111000000001': 'div rd,rs1,rs2',
  '01100111010000001': 'divu rd,rs1,rs2',
  '01100111100000001': 'rem rd,rs1,rs2',
  '01100111110000001': 'remu rd,rs1,rs2'
}
