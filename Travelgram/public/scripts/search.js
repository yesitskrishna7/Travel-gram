$('#destination-search').on('input', function() {
  var search = $(this).serialize();
  if(search === "search=") {
    search = "all"
  }
  $.get('/destinations?' + search, function(data) {
    $('#destination-grid').html('');
    data.forEach(function(destination) {
      $('#destination-grid').append(`
        <div class="col-md-3 col-sm-6">
          <div class="thumbnail">
            <img src="${ destination.image }">
            <div class="caption">
              <h4>${ destination.name }</h4>
            </div>
            <p>
              <a href="/destinations/${ destination._id }" class="btn btn-primary">More Info</a>
            </p>
          </div>
        </div>
      `);
    });
  });
});

$('#destination-search').submit(function(event) {
  event.preventDefault();
});