const requestIdleCallback = window.requestIdleCallback;

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

//* 通过虚拟dom，新建真实dom元素
function createDom(vdom) {
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

  return dom;
}

function render(vdom, container) {
  // 全局变量：第一次由render初始化
  wipRoot = {
    dom: container,
    props: {
      children: [vdom],
    },
  };
  nextUnitOfWork = wipRoot;

  // vdom.props.children.forEach(child => {
  //   render(child, dom);
  // });

  // container.appendChild(dom);
  // container.innerHTML = `<pre>${JSON.stringify(vdom, null, 2)}</pre>`;
}

function commitWorker(fiber) {
  // 没活干
  if (!fiber) return;
  const domParent = fiber.parent.dom;
  // dom操作
  domParent.appendChild(fiber.dom);
  commitWorker(fiber.child);
  commitWorker(fiber.slibing);
}

function commitRoot() {
  // 子元素
  commitWorker(wipRoot.child);

  // 便利完就设置null，不重复工作
  wipRoot = null;
}

// 全局变量: 下一个单元的任务
// 这个全局变量会第一次由render来初始化
let nextUnitOfWork = null;

let wipRoot = null;

// 调度我们的diff或者渲染任务
function workLoop(deadline) {
  // 有下一个任务，并且当前帧还没有结束
  while (nextUnitOfWork && deadline.timeRemaining() > 1) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);
  }
  if (!nextUnitOfWork && wipRoot) {
    // 没任务了，切根节点还在，就提交需要的工作任务
    commitRoot();
  }
  requestIdleCallback(workLoop);
}

// 启动空闲实现处理
requestIdleCallback(workLoop);

/*
  fiber = {
    dom: 真实dom
    parent: 父元素
    child: 第一个子元素
    slibing: 兄弟元素
  }
*/

function performUnitOfWork(fiber) {
  // 根据当前的任务，获取下一个任务
  if (!fiber.dom) {
    // 不是入口
    fiber.dom = createDom(fiber);
  }

  // 真实的dom操作
  // if (fiber.parent) {
  //   fiber.parent.dom.appendChild(fiber.dom);
  // }

  // 递归处理子元素
  // 现在还是vom阶段，准备构建成fiber
  const elements = fiber.props.children;
  let index = 0;
  let prevSlibing = null;
  while (index < elements.length) {
    let element = elements[index];
    const newFiber = {
      type: element.type,
      props: element.props,
      parent: fiber, // 指向父元素的fiber
      dom: null,
    };

    // 当前children中的第一个元素
    if (index === 0) {
      // 如果是第一个元素，则父fiber的child属性是该元素
      fiber.child = newFiber;
    } else {
      // 否则其他的是以
      prevSlibing.slibing = newFiber;
    }
    prevSlibing = fiber;
    index++;
  }

  // 找下一个任务
  // 先找子元素
  if (fiber.child) {
    return fiber.child;
  }
  // 没有子元素了，就找兄弟元素
  let nextFiber = fiber;
  while (nextFiber) {
    if (nextFiber.slibing) {
      return nextFiber.slibing;
    }
    // 没有兄弟元素了，就找父元素
    nextFiber = nextFiber.parent;
  }
}

export default {
  createElement,
  render,
};
