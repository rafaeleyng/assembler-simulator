var init = function() {
  var assembler = new app.Assembler();
  var assemblerViewModel = new app.ViewModel.Assembler(assembler);
  ko.applyBindings(assemblerViewModel);  
};

$(init);