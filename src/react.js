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
