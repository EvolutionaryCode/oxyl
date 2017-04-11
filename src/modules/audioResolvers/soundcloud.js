const request = require("request-promise");
const clientID = "2t9loNQH90kzJcsFCODdigxfp325aq4z";
module.exports = async link => {
	let data = JSON.parse(await request(`http://api.soundcloud.com/resolve.json?url=${link}&client_id=${clientID}`));
	if(data.kind === "track") {
		return {
			duration: Math.round(data.duration / 1000),
			id: data.id,
			service: "soundcloud",
			thumbnail: data.artwork_url,
			title: data.title
		};
	} else if(data.kind === "playlist") {
		let tracks = data.tracks.map(song => ({
			duration: Math.round(song.duration / 1000),
			id: song.id,
			service: "soundcloud",
			thumbnail: song.artwork_url,
			title: song.title
		}));
		tracks.title = data.title;
		return tracks;
	} else {
		return "INVALID_TYPE";
	}
};
const regex = module.exports.regex = /(?:http?s?:\/\/)?(?:www\.)?(?:soundcloud\.com|snd\.sc)\/(?:.*)/;
