import { TileCoord, Priority, SaveTile } from './types';

/**
 * Takes in a tile coordinate, fetches the tile image, and saves it to the cache in the form of
 * either an ImageData array or an ImageBitman, depending on options.priority
 * @param {Object} tileCoord
 */
export async function fetchDEMTile(
	tileCoord: TileCoord,
	token: string,
	priority: Priority,
	saveTile: SaveTile
) {
	const { X, Y, Z } = tileCoord;
	const imageUrl = `https://api.mapbox.com/v4/mapbox.terrain-rgb/${Z}/${X}/${Y}.pngraw?access_token=${token}`;
	const tileName = `X${X}Y${Y}Z${Z}`;

	// Create a canvas, so I can write the image data to it and then call getImageData on it
	var transferCanvas = document.createElement('canvas');
	transferCanvas.width = transferCanvas.height = 256;
	var c = transferCanvas.getContext('2d');

	await loadImage(imageUrl).then((image) => {
		if (priority === 'speed') {
			//
			// MORE STORAGE BUT MUCH FASTER
			// Draw the image to a canvas and then use Canvas2DContext.getImageData to pull the RGBA data
			// in the form of a Uint8Clamped array for the entire tile
			c.drawImage(image, 0, 0, 256, 256);
			var pixelData = c.getImageData(0, 0, 256, 256);
			saveTile(tileName, pixelData);
		} else {
			//
			// if (priority === "storage")
			// LESS STORAGE NEEDED BUT MUCH SLOWER:
			// Write the image to an ImageBitMap and then call .getImageData for each pixel inside the getElevation function
			createImageBitmap(image, 0, 0, 256, 256).then((ibm) =>
				saveTile(tileName, ibm)
			);
		}
	});
}

/**
 * Takes in image src url as string, returns promise that resolves when image is loaded
 * @param {String} src
 */
export function loadImage(src: string): Promise<CanvasImageSource> {
	return new Promise((resolve, reject) => {
		const img = new Image();
		img.crossOrigin = '*';
		img.addEventListener('load', () => resolve(img));
		img.addEventListener('error', (err) => reject(err));
		img.src = src;
	});
}
