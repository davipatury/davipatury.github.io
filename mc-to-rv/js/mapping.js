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
  'I': i => ([i.slice(20, 25), i.slice(12, 17), undefined     , i.slice(17, 20), undefined    , i[0].repeat(20) + i.slice(0, 12)]),
  'S': i => ([undefined      , i.slice(12, 17), i.slice(7, 12), i.slice(17, 20), undefined    , i[0].repeat(20) + i.slice(0, 7) + i.slice(20, 25)]),
  'J': i => ([i.slice(20, 25), undefined      , undefined     , undefined      , undefined    , i[0].repeat(12) + i.slice(12, 20) + i[11] + i.slice(1, 11)]),
  'B': i => ([undefined      , i.slice(12, 17), i.slice(7, 12), i.slice(17, 20), undefined    , i[0].repeat(20) + i[24] + i.slice(1, 7) + i.slice(20, 24)]),
  'U': i => ([i.slice(20, 25), undefined      , undefined     , undefined      , undefined    , i.slice(0, 20)])
}

/*
I: i[0] * 20 + i[1:12]
S: i[0] * 20 + i[1:7] + i[20:25]
J: i[0] * 12 + i[12:20] + i[11] + i[1:11] + '0'
B: i[0] * 20 + i[24] + i[1:7] + i[20:24] + '0'
U: i[0:20] + '0' * 12
*/

/*
 * REGISTER[i] = [ 'name', 'use' ]
 */
const REGISTERS = [
  [ 'zero', 'The constant value 0'             ],
  [ 'ra'  , 'Return Address'                   ],
  [ 'sp'  , 'Stack Pointer'                    ],
  [ 'gp'  , 'Global Pointer'                   ],
  [ 'tp'  , 'Thread Pointer'                   ],
  [ 't0'  , 'Temporary Register'               ],
  [ 't1'  , 'Temporary Register'               ],
  [ 't2'  , 'Temporary Register'               ],
  [ 's0'  , 'Saved Register/Frame Pointer'     ],
  [ 's1'  , 'Saved Register'                   ],
  [ 'a0'  , 'Function Argument/Return Value'   ],
  [ 'a1'  , 'Function Argument/Return Value'   ],
  [ 'a2'  , 'Function Argument'                ],
  [ 'a3'  , 'Function Argument'                ],
  [ 'a4'  , 'Function Argument'                ],
  [ 'a5'  , 'Function Argument'                ],
  [ 'a6'  , 'Function Argument'                ],
  [ 'a7'  , 'Function Argument'                ],
  [ 's2'  , 'Saved Register'                   ],
  [ 's3'  , 'Saved Register'                   ],
  [ 's4'  , 'Saved Register'                   ],
  [ 's5'  , 'Saved Register'                   ],
  [ 's6'  , 'Saved Register'                   ],
  [ 's7'  , 'Saved Register'                   ],
  [ 's8'  , 'Saved Register'                   ],
  [ 's9'  , 'Saved Register'                   ],
  [ 's10' , 'Saved Register'                   ],
  [ 's11' , 'Saved Register'                   ],
  [ 't3'  , 'Temporary Register'               ],
  [ 't4'  , 'Temporary Register'               ],
  [ 't5'  , 'Temporary Register'               ],
  [ 't6'  , 'Temporary Register'               ]
]

/*
 * 'opcode + funct3 + funct7': [ 'mnemonic', 'name' ]
 */
const INSTRUCTIONS = {
  '00000110000000000': [ 'lb rd,imm(rs1)'   , 'Load Byte'                 ],
  '00000110010000000': [ 'lh rd,imm(rs1)'   , 'Load Halfword'             ],
  '00000110100000000': [ 'lw rd,imm(rs1)'   , 'Load Word'                 ],
  '00000111000000000': [ 'lbu rd,imm(rs1)'  , 'Load Byte Unsigned'        ],
  '00000111010000000': [ 'lhu rd,imm(rs1)'  , 'Load Halfword Unsigned'    ],
  '00100110000000000': [ 'addi rd,rs1,imm'  , 'Add Immediate'             ],
  '00100110010000000': [ 'slli rd,rs1,imm'  , 'Shift Left Logical Imm'    ],
  '00100110100000000': [ 'slti rd,rs1,imm'  , 'Set Less Than Immediate'   ],
  '00100110110000000': [ 'sltiu rd,rs1,imm' , 'Set Less Than Imm Unsig'   ],
  '00100111000000000': [ 'xori rd,rs1,imm'  , 'XOR Immediate'             ],
  '00100111010000000': [ 'srli rd,rs1,imm'  , 'Shift Right Logical Imm'   ],
  '00100111010100000': [ 'srai rd,rs1,imm'  , 'Shift Right Arith Imm'     ],
  '00100111100000000': [ 'ori rd,rs1,imm'   , 'OR Immediate'              ],
  '00100111110000000': [ 'andi rd,rs1,imm'  , 'AND Immediate'             ],
  '00101110000000000': [ 'auipc rd,imm'     , 'Add Upper Immediate to PC' ],
  '01000110000000000': [ 'sb rs2,imm(rs1)'  , 'Store Byte'                ],
  '01000110010000000': [ 'sh rs2,imm(rs1)'  , 'Store Halfword'            ],
  '01000110100000000': [ 'sw rs2,imm(rs1)'  , 'Store Word'                ],
  '01100110000000000': [ 'add rd,rs1,rs2'   , 'Add'                       ],
  '01100110000100000': [ 'sub rd,rs1,rs2'   , 'Subtract'                  ],
  '01100110010000000': [ 'sll rd,rs1,rs2'   , 'Shift Left Logical'        ],
  '01100110100000000': [ 'slt rd,rs1,rs2'   , 'Set Less Than'             ],
  '01100110110000000': [ 'sltu rd,rs1,rs2'  , 'Set Less Than Unsigned'    ],
  '01100111000000000': [ 'xor rd,rs1,rs2'   , 'XOR'                       ],
  '01100111010000000': [ 'srl rd,rs1,rs2'   , 'Shift Right Logical'       ],
  '01100111010100000': [ 'sra rd,rs1,rs2'   , 'Shift Right Arithmetic'    ],
  '01100111100000000': [ 'or rd,rs1,rs2'    , 'OR'                        ],
  '01100111110000000': [ 'and rd,rs1,rs2'   , 'AND'                       ],
  '01101110000000000': [ 'lui rd,imm'       , 'Load Upper Immediate'      ],
  '11000110000000000': [ 'beq rs1,rs2,imm'  , 'Branch if Equal'           ],
  '11000110010000000': [ 'bne rs1,rs2,imm'  , 'Branch if Not Equal'       ],
  '11000111000000000': [ 'blt rs1,rs2,imm'  , 'Branch if Less Than'       ],
  '11000111010000000': [ 'bge rs1,rs2,imm'  , 'Branch Greater or Equal'   ],
  '11000111100000000': [ 'bltu rs1,rs2,imm' , 'Branch Less Than Unsign'   ],
  '11000111110000000': [ 'bgeu rs1,rs2,imm' , 'Branch Great or Eq Unsign' ],
  '11001110000000000': [ 'jalr rd,rs1,imm'  , 'Jump & Link Register'      ],
  '11011110000000000': [ 'jal rd,imm'       , 'Jump & Link'               ],
  '11100110000000000': [ 'ecall'            , 'Environment CALL'          ],
  '11100110010000000': [ 'csrrw rd,CSR,rs1' , 'CSR Read & Write'          ],
  '11100110100000000': [ 'csrrs rd,CSR,rs1' , 'CSR Read & Set'            ],
  '11100110110000000': [ 'csrrc rd,CSR,rs1' , 'CSR Read & Clear'          ],
  '11100111010000000': [ 'csrrwi rd,CSR,imm', 'CSR Read & Write Imm'      ],
  '11100111100000000': [ 'csrrsi rd,CSR,imm', 'CSR Read & Set Imm'        ],
  '11100111110000000': [ 'csrrci rd,CSR,imm', 'CSR Read & Clear Imm'      ],
  '01100110000000001': [ 'mul rd,rs1,rs2'   , 'Multiply'                  ],
  '01100110010000001': [ 'mulh rd,rs1,rs2'  , 'Multiply upper Half'       ],
  '01100110100000001': [ 'mulhsu rd,rs1,rs2', 'Mult upper Half Sign/Uns'  ],
  '01100110110000001': [ 'mulhu rd,rs1,rs2' , 'Mult upper Half Unsig'     ],
  '01100111000000001': [ 'div rd,rs1,rs2'   , 'Divide'                    ],
  '01100111010000001': [ 'divu rd,rs1,rs2'  , 'Divide Unsigned'           ],
  '01100111100000001': [ 'rem rd,rs1,rs2'   , 'Remainder'                 ],
  '01100111110000001': [ 'remu rd,rs1,rs2'  , 'Remainder Unsigned'        ]
}
