var Operation = function(operation, type, components, template) {
  this.operation = operation;
  this.type = type;
  this.template = template ? template : type;
  this.op = components.op;
  this.funct = components.funct;
  this.shamt = components.shamt;
  this.op = components.op;
};

var registers = [
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

String.prototype.padleft = function(len, chr) {
  var repeats = len - this.length;
  var pad = '';
  for (var i = 0; i < repeats; i++) {
    pad += chr;
  }
  return pad + this;
};

function validateRange(number, bits) {
  var pow = Math.pow(2, bits);
  var half = pow/2;
  var min = -half;
  var max = half - 1;
  return min <= number && number <= max; 
};

function intToBinary(int, bits) {
  int = parseInt(int);
  if (int>=0) {
    return int.toString(2).padleft(bits, "0");
  }
  return (-int-1).toString(2)
    .replace(/[01]/g, function(d){return +!+d;}) // inverts each char
    .padleft(bits, "1");
};

var regToBinary = function(reg) {
  var index = registers.indexOf(reg);
  return intToBinary(index, 5);
}

var operations = [
  new Operation('add', 'R', {op: '000000', shamt: '00000', funct: '100000'}),
  new Operation('sub', 'R', {op: '000000', shamt: '00000', funct: '100010'}),
  new Operation('and', 'R', {op: '000000', shamt: '00000', funct: '100100'}),
  new Operation('or',  'R', {op: '000000', shamt: '00000', funct: '100101'}),
  // new Operation('not', 'R', {op: '000000', shamt: '00000', funct: ''}),
  new Operation('slt', 'R', {op: '000000', shamt: '00000', funct: '101010'}),

  new Operation('addi', 'I', {op: '001000'}, 'I1'),
  // new Operation('subi', 'I', {op: ''}, 'I1'),
  new Operation('andi', 'I', {op: '001100'}, 'I1'),
  new Operation('ori',  'I', {op: '001101'}, 'I1'),
  // new Operation('noti', 'I', 'I1'),
  new Operation('slti', 'I', {op: '001010'}, 'I1'),
  new Operation('beq',  'I', {op: '000100'}, 'I1'),

  new Operation('lw', 'I', {op: '100011'}, 'I2'),
  new Operation('sw', 'I', {op: '101011'}, 'I2'),

  new Operation('j', 'J', {op: '000010'}),
];

var Instruction = function() {
  var self = this;

  this.operation = ko.observable();

  this.template = function() {
    return this.operation().template;
  }

  this.rs = ko.observable();
  this.rt = ko.observable();
  this.rd = ko.observable();
  this.imm = ko.observable();
  this.addr = ko.observable();

};

var stringForAssembly = function(assembly, template) {
  var string, format;

  if (template === 'R') {
    format = ':0 :1, :2, :3';     
    string = format
    .replace(':0', assembly.op)
    .replace(':1', assembly.rd)
    .replace(':2', assembly.rs)
    .replace(':3', assembly.rt)
    ;
  } else if (template === 'I1') {
    format = ':0 :1, :2, :3';
    string = format
    .replace(':0', assembly.op)
    .replace(':1', assembly.rt)
    .replace(':2', assembly.rs)
    .replace(':3', assembly.imm)
    ;
  } else if (template === 'I2') {
    format = ':0 :1, :2(:3)';
    string = format
    .replace(':0', assembly.op)
    .replace(':1', assembly.rt)
    .replace(':2', assembly.imm)
    .replace(':3', assembly.rs)
    ;
  } else if (template === 'J') {
    format = ':0 :1';
    string = format
    .replace(':0', assembly.op)
    .replace(':1', assembly.imm)
    ;
  }

  return string;
};

var assemblyForInstructionObject = function(instruction) {
  var template = instruction.operation().template;
  var assembly;

  var imm = Number(instruction.imm());
  if (Number.isNaN(imm)) {
    throw 'Invalid imm: ' + instruction.imm();
  }

  if (template === 'R') {
    assembly = {
      op: instruction.operation().operation,
      rd: instruction.rd(),
      rs: instruction.rs(),
      rt: instruction.rt(),
    };
  } else if (template === 'I1') {
    assembly = {
      op: instruction.operation().operation,
      rt: instruction.rt(),
      rs: instruction.rs(),
      imm: instruction.imm() || 0,
    };
  } else if (template === 'I2') {
    assembly = {
      op: instruction.operation().operation,
      rt: instruction.rt(),
      imm: instruction.imm() || 0,
      rs: instruction.rs()
    };
  } else if (template === 'J') {
    assembly = {
      op: instruction.operation().operation,
      imm: instruction.imm() || 0,
    };
  }
  return assembly;
};

var assemblyForInstructionString = function(string) {
  var parts = string
  .replace(new RegExp('[,()]', 'g'), '')
  .split(' ')
  ;

  var op = parts[0];
  var operation = getOperationWithName(op);
  var template = operation.template;

  var assembly;
  if (template === 'R') {
    assembly = {
      op: op,
      rd: parts[1],
      rs: parts[2],
      rt: parts[3]
    };
  } else if (template === 'I1') {
    assembly = {
      op: op,
      rt: parts[1],
      rs: parts[2],
      imm: parts[3]
    };
  } else if (template === 'I2') {
    assembly = {
      op: op,
      rt: parts[1],
      imm: parts[2],
      rs: parts[3]
    };
  } else if (template === 'J') {
    assembly = {
      op: op,
      imm: parts[1]
    };
  }
  return assembly;
};

var getOperationWithName = function(op) {
  for (var i in operations) {
    if (operations[i].operation === op) {
      return operations[i];
    }
  }
};

var compileAssembly = function(assembly) {
  var operation = getOperationWithName(assembly.op);
  var type = operation.type;
  var compiled, format;

  if (type === 'R') {
    format = ':0 :1 :2 :3 :4 :5';      
    compiled = format
    .replace(':0', operation.op)
    .replace(':1', regToBinary(assembly.rs))
    .replace(':2', regToBinary(assembly.rt))
    .replace(':3', regToBinary(assembly.rd))
    .replace(':4', operation.shamt)
    .replace(':5', operation.funct)
    ;
  } else if (type === 'I') {
    format = ':0 :1 :2 :3';
    compiled = format
    .replace(':0', operation.op)
    .replace(':1', regToBinary(assembly.rs))
    .replace(':2', regToBinary(assembly.rt))
    .replace(':3', intToBinary(assembly.imm, 16))
    ;
  } else if (type === 'J') {
    format = ':0 :1';
    compiled = format
    .replace(':0', operation.op)
    .replace(':1', intToBinary(assembly.imm, 26))
    ;
  }
  console.log(compiled);
  return compiled;
};

var ViewModel = function() {

  var self = this;

  this.tabs = {
    text: 0,
    fields: 1,
  };

  this.results = {
    compiled: ko.observable(''),
    assembly: ko.observable(''),
    signals: ko.observable(''),
  };

  this.error = ko.observable('');

  this.instructions = ko.observableArray();
  this.instructions.push(new Instruction());
  this.operations = ko.observableArray(operations);
  this.textarea = ko.observable();

  this.compileFromText = function() {
    var text = this.textarea();
    if (!text) {
      return;
    }

    var resultAssembly = '';
    var resultCompiled = '';
    var resultSignals = '';

    var lines = text.split('\n');
    for (var i in lines) {
      var assemblyLine = lines[i];
      var assemblyObj = assemblyForInstructionString(assemblyLine);
      console.log(assemblyLine);
      var compiled = compileAssembly(assemblyObj);

      resultAssembly += assemblyLine + '\n';
      resultCompiled += compiled + '\n';
      resultSignals += 'signals \n';
    }

    this.results.assembly(resultAssembly);
    this.results.compiled(resultCompiled);
    this.results.signals(resultSignals);
  };

  this.compileFromFields = function() {

    var resultAssembly = '';
    var resultCompiled = '';
    var resultSignals = '';

    for (var i in this.instructions()) {      
      var instruction = this.instructions()[i];
      var assemblyObj = assemblyForInstructionObject(instruction);
      var assemblyLine = stringForAssembly(assemblyObj, instruction.operation().template);
      console.log(assemblyLine);
      var compiled = compileAssembly(assemblyObj);

      resultAssembly += assemblyLine + '\n';
      resultCompiled += compiled + '\n';
      resultSignals += 'signals \n';
    }

    this.results.assembly(resultAssembly);
    this.results.compiled(resultCompiled);
    this.results.signals(resultSignals);    
  };

  this.compile = function() {
    try {
      this.cleanResults();
      if (this.selectedTab() === this.tabs.text) {
        this.compileFromText();
      } else {
        this.compileFromFields();
      }      
    } catch (e) {
      this.error(e);
    }
  };

  this.clickAdd = function(index) {
    this.instructions.splice(index + 1, 0, new Instruction());
  };

  this.clickRemove = function(index) {
    this.instructions.splice(index, 1);
  };

  this.enableRemove = function() {
    return this.instructions().length !== 1;
  };

  this.cleanResults = function() {
    for (var i in this.results) {
      this.results[i]('');
    }
  };

  // tabs
  this.selectedTab = ko.observable(0);
  this.selectTab = function(tab) {
    this.selectedTab(tab);
  };
  this.isSelectedTab = function(tab) {
    return this.selectedTab() === tab;
  };

  this.init = function() {

  };
  
  this.init();
};

ko.applyBindings(new ViewModel());