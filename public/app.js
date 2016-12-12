// Grabing articles as JSON
$.getJSON('/articles', function(data){
  // for(var i=0; i<data.length; i++){
  //   $('#articles').append('<p data-id="' + data[i]._id + '">' + data[i].title + '<br />' + data[i].link + '</p>');
  // }
  console.log(data);
});

// On click function that executes when user clicks a p tag
$(document).on('click', 'p', function(){
  $('#notes').empty();

  var thisId = $(this).attr('data-id');

  $.ajax({
    method: "GET",
    url: "/articles/" + thisId,
  })

    .done(function(data){
      console.log(data);
      // $('#notes').append('<h2>' + data.title + '</h2>');
      $('#notes').append('<input id="titleinput" name="title" >');
      $('#notes').append('<textarea id="bodyinput" name="body"></textarea>');
      $('#notes').append('<button data-id="' + data._id + '"id="addnote">Add Note</button>');

      if(data.note){
        $('#titleinput').val(data.note.title);
        $('#bodyinput').val(data.note.body);
      }
    });
});

// Function that executes when user clicks on addnote button
$(document).on('click', '#addnote', function(){
  var thisId = $(this).attr('data-id');
  
  // URL root (so it works in eith Local Host for Heroku)
  var baseURL = window.location.origin;

  $.ajax({
    method: "POST",
    url: "/add/note/" + thisId,
    data: {
      title: $('#titleinput').val(),
      body: $('#bodyinput').val()
    }
  })
    .done(function(data){
      console.log(data);
      $('#notes').empty();
    });

    $('#titleinput').val("");
    $('#bodyinput').val("");
});