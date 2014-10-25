var ViewModel = function() {

  var self = this;

  this.format = ko.observable('J');
  this.formats = [
    {
      format: 'R',
      instructions: ['add', 'sub', 'and', 'or'],
    }, 
    {
      format: 'I',
      instructions: ['addi', 'andi', 'ori'],
    }, 
    {
      format: 'J',
      instructions: ['j', 'jr'],
    },
  ];

  this.template = function() {
    return this.format().format;
  };


  this.formatLabel = function() {
    return this.format().format + '-Type';
  }
  this.visible = function(format) {
    return this.format().format === format;
  };

  this.init = function() {
  };
  
  this.init();

};

ko.applyBindings(new ViewModel());