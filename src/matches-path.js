// Replace regexp for special characters in a path
var pathRegex = /[\-\[\]\/\{\}\(\)\*\+\?\.\\\\^\$\|]/g;

module.exports = function matchesPath (path1, path2) {
	return new RegExp('^' + path1.replace(pathRegex, '\\$&')).test(path2);
};
