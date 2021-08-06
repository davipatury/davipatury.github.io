//const complemento = (val, bits) => (val & (1 << (bits - 1))) != 0 ? val - (1 << bits) : val

const mc_to_rv = (entry, entry_type) => {
  let code = null
  if (entry_type === 'hex') {
    code = parseInt(entry, 16).toString(2).padStart(32, '0')
  } else if (entry_type === 'binary') {
    code = entry
  }

  if (!code || code.length !== 32) {
    throw new Error('Invalid entry')
  }

  const opcode = code.slice(25)
  const type = OPCODE_TO_TYPE[opcode]
  if (!type) {
    throw new Error('Unsupported opcode')
  }

  const [
    rd  = '00000',
    rs1 = '00000',
    rs2 = '00000',
    funct3 = '000',
    funct7 = '0000000',
    imm = '0000000'
  ] = TYPE_PARSE[type](code)

  const instruction = SYNTAX[opcode + funct3 + funct7]
  if (!instruction) {
    throw new Error('Unsupported instruction')
  }

  return instruction
    .replace('rd' , REGISTERS[parseInt(rd , 2)])
    .replace('rs1', REGISTERS[parseInt(rs1, 2)])
    .replace('rs2', REGISTERS[parseInt(rs2, 2)])
    .replace('imm', ~~parseInt(imm, 2))
}

const button = document.getElementById('submit')
const input = document.getElementById('input')
const result = document.getElementById('result')

button.addEventListener('click', () => {
  try {
    const entry = input.value.trim()
    const type = entry.startsWith('0b') ? 'binary' : entry.startsWith('0x') ? 'hex' : null
    const instruction = mc_to_rv(entry.slice(2), type)

    result.textContent = instruction
    result.classList.remove('disabled')
  } catch (e) {
    result.textContent = e.message
    result.classList.add('disabled')
  }
})