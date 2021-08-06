const complement = (val, bits) => (val & (1 << (bits - 1))) !== 0 ? val - (1 << bits) : val

const machineCodeToInstruction = (entry, entry_type) => {
  let code = null
  if (entry_type === 'hex') {
    code = parseInt(entry, 16).toString(2).padStart(32, '0')
  } else if (entry_type === 'binary') {
    code = entry
  }

  if (!code || code.length !== 32) {
    throw new Error('Invalid input')
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
    imm = '0'
  ] = TYPE_PARSE[type](code)

  const instruction = INSTRUCTIONS[opcode + funct3 + funct7]
  if (!instruction) {
    throw new Error('Unsupported instruction')
  }

  console.log(code)
  console.log(type, imm.length, imm)

  const [ rdName , rdUse  ] = REGISTERS[parseInt(rd , 2)]
  const [ rs1Name, rs1Use ] = REGISTERS[parseInt(rs1, 2)]
  const [ rs2Name, rs2Use ] = REGISTERS[parseInt(rs2, 2)]

  const immInt = parseInt(imm, 2)
  const immValue = imm.length === 32 ? ~~immInt : complement(immInt, imm.length)
  const immHexValue = '0x' + immInt.toString(16).padStart(imm.length / 4, '0')

  const [ instMnemonic, instName ] = instruction
  const [ mnemonic, args ] = instMnemonic.split(' ')

  const mnemonicHTML = `<span data-tooltip="${instName}">${mnemonic}</span>`
  if (args) {
    const argsHTML = args
      .replace('rd' , `<span data-tooltip="${rdUse}">${rdName}</span>`)
      .replace('rs1', `<span data-tooltip="${rs1Use}">${rs1Name}</span>`)
      .replace('rs2', `<span data-tooltip="${rs2Use}">${rs2Name}</span>`)
      .replace('imm', `<span data-tooltip="${immHexValue}">${immValue}</span>`)
    return `${mnemonicHTML} ${argsHTML}`
  }
  return mnemonicHTML
}

const button = document.getElementById('submit')
const input = document.getElementById('input')
const result = document.getElementById('result')

button.addEventListener('click', () => {
  try {
    const entry = input.value.trim()
    if (!entry) return
    const type = entry.startsWith('0b') ? 'binary' : entry.startsWith('0x') ? 'hex' : null
    const instruction = machineCodeToInstruction(entry.slice(2), type)

    result.innerHTML = instruction
    result.classList.remove('disabled')
  } catch (e) {
    result.innerHTML = e.message
    result.classList.add('disabled')
  }
})