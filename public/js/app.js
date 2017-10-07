var main = function() {
  $(".button-collapse").sideNav();
  $('.parallax').parallax();
  $('.modal').modal();
  
  $(document).on('click', '#plus', function(event) {
    event.preventDefault();
    var priceValue = parseFloat($('#priceValue').val());
    var quantity = parseInt($('#quantity').val());
    
    priceValue += parseFloat($('#priceHidden').val());
    quantity += 1;

    $('#quantity').val(quantity);
    $('#priceValue').val(priceValue.toFixed(2));
    $('#total').html(quantity);
  });

  $(document).on('click', '#minus', function(event) {
    event.preventDefault();
    var priceValue = parseFloat($('#priceValue').val());
    var quantity = parseInt($('#quantity').val());
    
    if(quantity > 1) {
      priceValue -= parseFloat($('#priceHidden').val());
      quantity -= 1;

      $('#quantity').val(quantity);
      $('#priceValue').val(priceValue.toFixed(2));
      $('#total').html(quantity);
    }
  });
}
$(document).ready(main);