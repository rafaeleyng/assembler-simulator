var app = app || {};

app.Assembler = function() {
  this.immediateBits = {
    I: 16,
    J: 26,
  };

  this.types = {
    R: 'R',
    I: 'I',
    J: 'J',
  };

  this.templates = {
    R1: 'R1',
    R2: 'R2',
    I1: 'I1',
    I2: 'I2',
    J: 'J',
  };

  this.registersToValidate = {
    R: ['rs', 'rt', 'rd'], 
    I1: ['rs', 'rt'],
    I2: ['rs', 'rt'],
  };

  this.registers = [
    '$0',
    '$at',
    '$v0',
    '$v1',
    '$a0',
    '$a1',
    '$a2',
    '$a3',
    '$t0',
    '$t1',
    '$t2',
    '$t3',
    '$t4',
    '$t5',
    '$t6',
    '$t7',
    '$s0',
    '$s1',
    '$s2',
    '$s3',
    '$s4',
    '$s5',
    '$s6',
    '$s7',
    '$t8',
    '$t9',
    '$k0',
    '$k1',
    '$gp',
    '$sp',
    '$fp',
    '$ra',
  ];

  this.operations = [
    new app.Model.Operation('add', this.types.R, {opcode: '000000', shamt: '00000', funct: '100000'}, this.templates.R1),
    new app.Model.Operation('sub', this.types.R, {opcode: '000000', shamt: '00000', funct: '100010'}, this.templates.R1),
    new app.Model.Operation('and', this.types.R, {opcode: '000000', shamt: '00000', funct: '100100'}, this.templates.R1),
    new app.Model.Operation('or',  this.types.R, {opcode: '000000', shamt: '00000', funct: '100101'}, this.templates.R1),
    // new app.Model.Operation('not', this.types.R, {opcode: '000000', shamt: '00000' }, this.templates.R2),
    new app.Model.Operation('slt', this.types.R, {opcode: '000000', shamt: '00000', funct: '101010'}, this.templates.R1),

    new app.Model.Operation('addi', this.types.I, {opcode: '001000'}, this.templates.I1),
    new app.Model.Operation('subi', this.types.I, {opcode: ''}, this.templates.I1),
    new app.Model.Operation('andi', this.types.I, {opcode: '001100'}, this.templates.I1),
    new app.Model.Operation('ori',  this.types.I, {opcode: '001101'}, this.templates.I1),
    new app.Model.Operation('slti', this.types.I, {opcode: '001010'}, this.templates.I1),
    new app.Model.Operation('beq',  this.types.I, {opcode: '000100'}, this.templates.I1),

    new app.Model.Operation('lw', this.types.I, {opcode: '100011'}, this.templates.I2),
    new app.Model.Operation('sw', this.types.I, {opcode: '101011'}, this.templates.I2),

    new app.Model.Operation('j', this.types.J, {opcode: '000010'}),
  ];

  this.padLeft = function(string, len, chr) {
    var repeats = len - string.length;
    var pad = '';
    for (var i = 0; i < repeats; i++) {
      pad += chr;
    }
    return pad + string;
  };

  this.getRange = function (bits) {
    var pow = Math.pow(2, bits);
    var half = pow/2;
    var min = -half;
    var max = half - 1;
    return {min: min, max: max};  
  };

  this.validateRange = function(number, bits) {
    var range = this.getRange(bits);
    return range.min <= number && number <= range.max; 
  };

  this.intToBinary = function(int, bits) {
    int = parseInt(int);
    if (int>=0) {
      return this.padLeft(int.toString(2), bits, '0');
    }
    var bin = (-int-1).toString(2).replace(/[01]/g, function(d){return +!+d;}) // inverts each char    
    bin = this.padLeft(bin, bits, '1');
    return bin;
  };

  this.regToBinary = function(reg) {
    var index = this.registers.indexOf(reg);
    return this.intToBinary(index, 5);
  };

  this.assemblyStrForInstruction = function(instruction) {
    var template = instruction.operation().template;
    var type = instruction.operation().type;

    var imm = Number(instruction.imm());
    var op = instruction.operation().operation;
    var rd = instruction.rd();
    var rs = instruction.rs();
    var rt = instruction.rt();

    if (template === this.templates.R1) {
      format = ':0 :1, :2, :3';     
      return format
      .replace(':0', op)
      .replace(':1', rd)
      .replace(':2', rs)
      .replace(':3', rt)
      ;
    } 
    if (template === this.templates.I1) {
      format = ':0 :1, :2, :3';
      return format
      .replace(':0', op)
      .replace(':1', rt)
      .replace(':2', rs)
      .replace(':3', imm)
      ;
    }
    if (template === this.templates.I2) {
      format = ':0 :1, :2(:3)';
      return format
      .replace(':0', op)
      .replace(':1', rt)
      .replace(':2', imm)
      .replace(':3', rs)
      ;
    }
    if (template === this.templates.J) {
      format = ':0 :1';
      return format
      .replace(':0', op)
      .replace(':1', imm)
      ;
    }
  };

  this.assemblyStrToAssemblyObj = function(string) {
    var parts = string
    .replace(new RegExp('[,)]', 'g'), '')
    .replace('(', ' ')
    .split(' ')
    ;

    var errorMessage = 'Invalid expression, too many symbols';

    if (parts.length > 4) {
      throw errorMessage;
    }

    var op = parts[0];
    var operation = this.getOperationWithName(op);
    var template = operation.template;

    if (template === this.templates.R1) {
      return {
        op: op,
        rd: parts[1],
        rs: parts[2],
        rt: parts[3]
      };
    }
    if (template === this.templates.I1) {
      return {
        op: op,
        rt: parts[1],
        rs: parts[2],
        imm: parts[3]
      };
    }
    if (template === this.templates.I2) {
      return {
        op: op,
        rt: parts[1],
        imm: parts[2],
        rs: parts[3]
      };
    }
    if (template === this.templates.J) {
      if (parts.length > 2) {
        throw errorMessage;
      }    
      return {
        op: op,
        imm: parts[1]
      };
    }
  };

  this.needSplit = function(assemblyObj) {
    return ['not', 'subi'].indexOf(assemblyObj.op) !== -1;
  };

  this.splitAssemblyResult = function(assemblyResult) {
    var op = assemblyResult.obj.op;
    var assemblyResultStrs = [];
    // debugger
    if (op === 'not') {
      var assemblyStr1 = 'nor :0, :1, $0'
      .replace(':0', assemblyResult.obj.rd)
      .replace(':1', assemblyResult.obj.rs)
      ;
      console.log(assemblyStr1);

      assemblyResultStrs.push(assemblyStr1);

    } else if (op === 'subi') {
      var assemblyStr1 = 'addi $at, $0, :0'
      .replace(':0', assemblyResult.obj.imm)
      ;

      var assemblyStr2 = 'sub :0, :1, $at'
      .replace(':0', assemblyResult.obj.rt)
      .replace(':1', assemblyResult.obj.rs) // TODO conferir aqui se é realmente rt e rs
      ;

      assemblyResultStrs.push(assemblyStr1);
      assemblyResultStrs.push(assemblyStr2);
    }

    var assemblyResults = [];
    for (var i in assemblyResultStrs) {
      var assemblyResultStr = assemblyResultStrs[i];
      assemblyResults.push({
        str: assemblyResultStr,
        obj: this.assemblyStrToAssemblyObj(assemblyResultStr),
      })
    }
    return assemblyResults;
  };

  this.assemblyStrToAssemblyObjs = function(assemblyStr) {
    var assemblyObj = this.assemblyStrToAssemblyObj(assemblyStr);
    var assemblyResult = { str: assemblyStr, obj: assemblyObj };
    
    var assemblyResults = this.needSplit(assemblyObj) ? this.splitAssemblyResult(assemblyResult) : [assemblyResult];

    return assemblyResults;
  };

  this.getOperationWithName = function(op) {
    for (var i in this.operations) {
      if (this.operations[i].operation === op) {
        return this.operations[i];
      }
    }
    throw "Unsuported op";
  };

  this.isCollection = function(obj) {
    return Object.prototype.toString.call([]).substr(8, 5) === 'Array';
  };

  this.areValidRegisters = function(assemblyObj, regs) {

    if (regs === undefined) {
      return true;
    }

    regs = this.isCollection(regs) ? regs : [regs];
    for (var i in regs) {
      var reg = assemblyObj[regs[i]];
      var index = this.registers.indexOf(reg);
      if (index === -1) {
        return false;
      }
    }
    return true;
  };

  this.validateAssemblyObj = function(assemblyObj, operation) {

    var template = operation.template;
    var type = operation.type;

    var regsToValidate = this.registersToValidate[template];

    if (!this.areValidRegisters(assemblyObj, regsToValidate)) {
      throw 'Invalid registers';    
    }

    if (type === this.types.R) {
      return;
    }

    var imm = assemblyObj.imm;

    if (Number.isNaN(imm) || imm === 'NaN') {
      throw 'Invalid imm';
    }

    var bits = this.immediateBits[type];
    var range = this.getRange(bits);
    if (!this.validateRange(imm, bits)) {
      throw 'imm overflow: min :min, max :max'.replace(':min', range.min).replace(':max', range.max);
    }
  };

  this.compileAssemblyObj = function(assemblyObj) {

    var operation = this.getOperationWithName(assemblyObj.op);

    this.validateAssemblyObj(assemblyObj, operation);

    var type = operation.type;

    if (type === this.types.R) {
      return ':0 :1 :2 :3 :4 :5'
      .replace(':0', operation.opcode)
      .replace(':1', this.regToBinary(assemblyObj.rs))
      .replace(':2', this.regToBinary(assemblyObj.rt))
      .replace(':3', this.regToBinary(assemblyObj.rd))
      .replace(':4', operation.shamt)
      .replace(':5', operation.funct)
      ;
    }

    if (type === this.types.I) {
      return ':0 :1 :2 :3'
      .replace(':0', operation.opcode)
      .replace(':1', this.regToBinary(assemblyObj.rs))
      .replace(':2', this.regToBinary(assemblyObj.rt))
      .replace(':3', this.intToBinary(assemblyObj.imm, 16))
      ;
    } 

    if (type === this.types.J) {
      return ':0 :1'
      .replace(':0', operation.opcode)
      .replace(':1', this.intToBinary(assemblyObj.imm, 26))
      ;
    }
  };
};