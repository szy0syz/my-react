# my-react

> Implement a react.js with you.

## Menu

1. jsx
2. createElement
3. render
4. concurrent
5. commit
6. reconciliation
7. function component
8. hooks
9. class

## 1. jsx

```js
// ---- src/index.js ----
import React from './react'

let ReactDOM = React;

let element = <div>
  <h1>My-React</h1>
  <p>全栈工程师之路</p>
  <a href="http://jerryshi.com">Link to Blog</a>
</div>

ReactDOM.render(element, document.getElementById('root'));
```

```js
// ---- src/react.js ----
function createElement(type, props, ...children) {
  delete props.__source;
  return {
    type,
    props: {
      ...props,
      children: children.map(child => {
        return typeof child === 'object'
          ? child // 如果是对象就返回
          : createTextElement(child); // 创建文本元素
      }),
    },
  };
}

function createTextElement(text) {
  return {
    type: 'TEXT',
    props: {
      nodeValue: text,
      children: [], // 类幂等
    },
  };
}

function render(vdom, container) {
  const dom =
    vdom.type === 'TEXT'
      ? document.createTextNode('') // --
      : document.createElement(vdom.type); // --

  Object.keys(vdom.props)
    .filter(key => key !== 'children')
    .forEach(name => {
      //TODO: 时间处理 属性兼容
      dom[name] = vdom.props[name];
    });

  vdom.props.children.forEach(child => {
    render(child, dom);
  });

  container.appendChild(dom);

  // container.innerHTML = `<pre>${JSON.stringify(vdom, null, 2)}</pre>`;
}

export default {
  createElement,
  render,
};
```

```json
{
  "type": "div",
  "props": {
    "children": [
      {
        "type": "h1",
        "props": {
          "children": [
            {
              "type": "TEXT",
              "props": {
                "nodeValue": "My-React",
                "children": []
              }
            }
          ]
        }
      },
      {
        "type": "p",
        "props": {
          "children": [
            {
              "type": "TEXT",
              "props": {
                "nodeValue": "全栈工程师之路",
                "children": []
              }
            }
          ]
        }
      },
      {
        "type": "a",
        "props": {
          "href": "http://jerryshi.com",
          "children": [
            {
              "type": "TEXT",
              "props": {
                "nodeValue": "Link to Blog",
                "children": []
              }
            }
          ]
        }
      }
    ]
  }
}
```
