<?php 
	$id = $_GET["id"];
	error_reporting(0);
	$idmd = md5($id);
	$cachepath = "/var/www/html/downable-api/cache/$idmd/img.jpg";
	if (file_exists($cachepath)) {
		echo "https://home.capthnds.me/downable-api/cache/$idmd/img.jpg"; 
	} else {
		$content = @file_get_contents("https://img.youtube.com/vi/$id/maxresdefault.jpg");
		if ($content === false) {
			$new = @file_get_contents("https://img.youtube.com/vi/$id/0.jpg");
			if ($new === false) {
				
			} else {
			file_put_contents($cachepath, $new);
			echo "https://home.capthnds.me/downable-api/cache/$idmd/img.jpg"; 
			}
		} else {
		file_put_contents($cachepath, $content);
		echo "https://home.capthnds.me/downable-api/cache/$idmd/img.jpg"; 
		}
	}