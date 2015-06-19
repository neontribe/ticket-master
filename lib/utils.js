'use strict';

//credit stackoverflow person
function truncate(word, n, useWordBoundary) {
   var toLong = word.length>n,
       s_ = toLong ? word.substr(0,n-1) : word;
   s_ = useWordBoundary && toLong ? s_.substr(0,s_.lastIndexOf(' ')) : s_;
   return  toLong ? '(' + s_ + '-)' : '(' + s_ + '-)';
};

module.exports = {
	truncate: truncate
}
