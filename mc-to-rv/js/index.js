const complement = (val, bits) => (val & (1 << (bits - 1))) !== 0 ? val - (1 << bits) : val

const isNotBinary = text => text.split('').find(c => c !== '0' && c !== '1')

const hexChars = ['a', 'b', 'c', 'd', 'e', 'f']
const isNotHex = text => text.toLowerCase().split('').find(c => isNaN(c) && !hexChars.includes(c))

const machineCodeToInstruction = (entry, entry_type) => {
  let code
  if (entry_type === 'binary') {
    if (entry.length !== 32) {
      throw new Error('Binary input must be 32 bit sized')
    }

    const invalidChar = isNotBinary(entry)
    if (invalidChar) {
      throw new Error(`Invalid binary character: "${invalidChar}"`)
    }

    code = entry
  } else if (entry_type === 'hex') {
    if (entry.length !== 8) {
      throw new Error('Hexadecimal input must be 8 characters long')
    }

    const invalidChar = isNotHex(entry)
    if (invalidChar) {
      throw new Error(`Invalid hexadecimal character: "${invalidChar}"`)
    }

    code = parseInt(entry, 16).toString(2).padStart(32, '0')
  }

  if (!code || code.length !== 32) {
    throw new Error('Invalid input')
  }

  const opcode = code.slice(25)
  const type = OPCODE_TO_TYPE[opcode]
  if (!type) {
    throw new Error(`Unsupported opcode: ${opcode}`)
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
    throw new Error(`Unsupported instruction: ${opcode} | ${funct3} | ${funct7}`)
  }

  const rdInt  = parseInt(rd , 2)
  const rs1Int = parseInt(rs1, 2)
  const rs2Int = parseInt(rs2, 2)

  const [ rdName , rdUse  ] = REGISTERS[rdInt]
  const [ rs1Name, rs1Use ] = REGISTERS[rs1Int]
  const [ rs2Name, rs2Use ] = REGISTERS[rs2Int]

  const immInt = parseInt(imm, 2)
  const immValue = imm.length === 32 ? ~~immInt : complement(immInt, imm.length)
  const immHexValue = '0x' + immInt.toString(16).padStart(imm.length / 4, '0')

  const [ instMnemonic, instName ] = instruction
  const [ mnemonic, args ] = instMnemonic.split(' ')

  const mnemonicHTML = `<span data-tooltip="${instName}">${mnemonic}</span>`
  if (args) {
    const argsHTML = args
      .replace('rd' , `<span data-tooltip="x${rdInt} | ${rdUse}">${rdName}</span>`)
      .replace('rs1', `<span data-tooltip="x${rs1Int} | ${rs1Use}">${rs1Name}</span>`)
      .replace('rs2', `<span data-tooltip="x${rs2Int} | ${rs2Use}">${rs2Name}</span>`)
      .replace('imm', `<span data-tooltip="${immHexValue}">${immValue}</span>`)
    return `${mnemonicHTML} ${argsHTML}`
  }
  return mnemonicHTML
}

const button = document.getElementById('submit')
const input = document.getElementById('input')
const result = document.getElementById('result')

const convert = () => {
  try {
    let entry = input.value.trim()
    if (!entry) return

    let type = entry.startsWith('0b') ? 'binary' : entry.startsWith('0x') ? 'hex' : null
    if (!type) {
      if (!isNotBinary(entry))   type = 'binary'
      else if (!isNotHex(entry)) type = 'hex'
    } else {
      entry = entry.slice(2)
    }

    const instruction = machineCodeToInstruction(entry, type)

    result.innerHTML = instruction
    result.classList.remove('disabled')
  } catch (e) {
    result.innerHTML = e.message
    result.classList.add('disabled')
  }
}

button.addEventListener('click', convert)

input.addEventListener('keyup', e => {
  if (e.key === 'Enter') {
    convert()
  }
})
