function previewImage(event) { 
	var reader = new FileReader();
	var iteraciones = 0;
	reader.onload = function() {
		var edittext = document.getElementById("edittext");
		const copyBtn = document.getElementById('copy-btn');
		copyBtn.addEventListener('click', () => {
			edittext.select();
			document.execCommand('copy');
			window.getSelection().removeAllRanges();
		});

		const reductionValue = document.querySelector('input[name="resize"]:checked').value;
		// console.log("Selected reduction to " + reductionValue);
		const ditherCheckbox = document.getElementById("ditherCheckbox");
		const spinner = document.getElementById("spinner");
		const ditherEnabled = ditherCheckbox.checked;
		//edittext.style.display = "none";
		spinner.style.display = "inline-block";
		
		var output = document.getElementById("image-preview");
		output.src = reader.result;
		var canvas = document.createElement("canvas");
		var context = canvas.getContext("2d");
		var img = new Image();
		img.onload = function() {
			if (reductionValue != 280){
				var maxDimension = reductionValue;
				var width = img.width;
				var height = img.height;
				if (width > maxDimension || height > maxDimension) {
					if (width > height) {
						height *= maxDimension / width;
						width = maxDimension;
					} else {
						width *= maxDimension / height;
						height = maxDimension;
					}
				}
				canvas.width = width;
				canvas.height = height;
			}else{
				var originalWidth = img.width;
				console.log(originalWidth);
				var originalHeight = img.height
				console.log(originalHeight);
				var originalRatio = originalWidth / originalHeight;
				console.log(originalRatio);
				var maxPixels = 280;
				var maxWidth = Math.sqrt(maxPixels * originalRatio);
				var maxHeight = Math.sqrt(maxPixels / originalRatio);
				console.log(maxWidth);
				console.log(maxHeight);
				if (originalWidth > originalHeight) {
					canvas.width = Math.min(originalWidth, maxWidth);
					canvas.height = canvas.width / originalRatio;
				} else {
					canvas.height = Math.min(originalHeight, maxHeight);
					canvas.width = canvas.height * originalRatio;
				}
			}

			context.drawImage(img, 0, 0, canvas.width, canvas.height);
			var imageData = context.getImageData(0, 0, canvas.width, canvas.height);
			var pixelData = imageData.data;
			var grayPixels = [];
			for (var i = 0; i < pixelData.length; i += 4) {
				var r = pixelData[i];
				var g = pixelData[i + 1];
				var b = pixelData[i + 2];
				var gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
				grayPixels.push(gray);
			}

			var rows = canvas.height;
			var cols = canvas.width;
			var outputStr = "";
			var index = 0;
			for (var i = 0; i < rows; i++) {
				for (var j = 0; j < cols; j++) {
					var pixelLevel = grayPixels[index];
					var filteredMaps = kanjiMap.filter((map) => map.luminance === pixelLevel);
					//console.log("Number of kanji with L=" + pixelLevel + " \t"+filteredMaps.length);
					while ((filteredMaps.length == 0) && iteraciones< 10){
						//console.log("Couldn't find any kanji with L="+pixelLevel);
						pixelLevel++;
						//console.log("New L="+pixelLevel);
						filteredMaps = kanjiMap.filter((map) => map.luminance === pixelLevel);
						//console.log("\tNumber of kanji with L=" + pixelLevel + " \t"+filteredMaps.length);
						iteraciones++;
					}
					iteraciones = 0;
					cValues = filteredMaps.map((map) => map.kanji);
					//console.log("Level: " + pixelLevel + " " + cValues[0]);
					index = i * cols + j;
					if (ditherEnabled){
						var randomIndex = Math.floor(Math.random() * cValues.length);
						outputStr += cValues[randomIndex] + "";
					}
					else{
						outputStr += cValues[0] + "";
					}
				}
				outputStr += "\n";
			}
			edittext.value = outputStr;
			edittext.setAttribute("cols", cols*2.2);
			edittext.setAttribute("rows", rows+5);
			edittext.style.display = "inline-block";
			copyBtn.style.display = "inline-block";
			spinner.style.display = "none";

		};
		img.src = reader.result;
	};
	reader.readAsDataURL(event.target.files[0]);
}