'use strict'

angular.module('colorListService', []).provider('colorList', function(){

	var $this = this;	
	this.$get = () => this;

	this.colors = [
		['212121', '616161', '9E9E9E', 'E0E0E0', 'F5F5F5'],
		['0D47A1', '1976D2', '2196F3', '64B5F6', 'BBDEFB'],
		['1B5E20', '388E3C', '4CAF50', '81C784', 'C8E6C9'],
		['FF6F00', 'FFA000', 'FFC107', 'FFD54F', 'FFECB3'],
		['B71C1C', 'D32F2F', 'F44336', 'E57373', 'FFCDD2'],
		['4A148C', '7B1FA2', '9C27B0', 'BA68C8', 'E1BEE7'],				
	];
	
	this.borderContrastColor = '#888';
	this.contrastColor = '#444';

	this.config = (colors, contrastColor, borderContrastColor) => {
		if (!!colors)
			this.colors = colors;
		if (!!contrastColor)
			this.contrastColor = contrastColor;
		if (!!borderContrastColor)
			this.borderContrastColor = borderContrastColor;
	}

	this.getColorIndex = color => {
		let idx = {};
		for (var r = this.colors.length - 1; r >= 0; r--) {
			for (var c = this.colors[r].length - 1; c >= 0; c--) {
				if (color == this.colors[r][c]) {
					idx.row = r;
					idx.col = c;			
					break;
				}
			}
		}
		return idx;
	}

	this.getBorderColor = color => {
		let idx = this.getColorIndex(color);
		if (idx.col >= 4 || (idx.row == 0 && idx.col == 3))
			return this.borderContrastColor;
		return '#' + color;
	}

	this.getContrastColor = (c, r) => {					
		let idx = {};		
		idx.col = c;
		idx.row = r;
		if (r === undefined)
			idx = this.getColorIndex(c);													
		if (idx.col >= 4 || (idx.row == 0 && idx.col == 3))
			return this.contrastColor;
		return 'white';
	}

});