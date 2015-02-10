function init(){
	$('#playnow').click(function(){
		$('#playnow-container').fadeOut('fast', function(){
			generateCode();
			$('#instructions').fadeIn('fast');
			var conn = io.connect("http://localhost:8080",{transports: ['websocket', 'polling', 'flashsocket']});
			conn.emit('temporal-web',$('#code h1').html());
			conn.on('match-correct', function(code){
				console.log("CODE: " + code);
				if(code == $('#code h1').html()){
					var href = window.location.href;
					href = href.substr(0,href.indexOf('/'));
					href = href + "/game?code=" + code;
					window.location.href = href;
				}
			});
		});
	});
}

function generateCode(){
	var text = "";
	var code = "0123456789";
	for( var i=0; i < 5; i++ )
		text += code.charAt(Math.floor(Math.random() * code.length));
	$("#code h1").html(text);
}

window.onload = init;