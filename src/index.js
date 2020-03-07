import React from './react'

let ReactDOM = React;

let element = <div>
  <h1>My-React</h1>
  <p>全栈工程师之路</p>
  <a href="http://jerryshi.com">Link to Blog</a>
</div>

ReactDOM.render(element, document.getElementById('root'));
