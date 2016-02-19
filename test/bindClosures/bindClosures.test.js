import React from 'react';
import jsdom from 'mocha-jsdom';
import { expect } from 'chai';
import { mount } from 'enzyme';
import sinon from 'sinon';
import bindClosures from '../../src';

function createComponents() {
  const boundOnCompleteSpy = sinon.spy(({ onComplete, id }) => {
    onComplete(id);
  });

  let TodoItem = ({ title, onComplete }) => (
    <li>
      <div>{title}</div>
      <button onClick={onComplete}>Complete</button>
    </li>
  );

  TodoItem = bindClosures({
    onComplete: boundOnCompleteSpy,
  })(TodoItem);

  const TodoList = ({ items, onComplete }) => (
    <ul>
      {items.map(item => (
        <TodoItem
          key={item.id}
          onComplete={onComplete}
          {...item}
        />
      ))}
    </ul>
  );

  return { boundOnCompleteSpy, TodoItem, TodoList };
}

const todoItems = [
  { id: 1, title: 'Buy milk' },
  { id: 2, title: 'Write tests' },
];

function noop() {}

describe('bindClosures', () => {
  jsdom();

  it('calls the bound closure with the original props', () => {
    const { boundOnCompleteSpy, TodoList } = createComponents();

    const wrapper = mount(
      <TodoList
        items={todoItems}
        onComplete={noop}
      />
    );

    wrapper.find('li').find('button').forEach(button => {
      button.simulate('click');
    });

    expect(boundOnCompleteSpy).to.have.been.calledTwice;

    expect(boundOnCompleteSpy.args[0][0]).to.deep.equal({
      id: 1,
      title: 'Buy milk',
      onComplete: noop,
    });

    expect(boundOnCompleteSpy.args[1][0]).to.deep.equal({
      id: 2,
      title: 'Write tests',
      onComplete: noop,
    });
  });

  it('calls the original function', () => {
    const { TodoList } = createComponents();
    const completeSpy = sinon.spy();

    const wrapper = mount(
      <TodoList
        items={todoItems}
        onComplete={completeSpy}
      />
    );

    wrapper.find('li').find('button').forEach(button => {
      button.simulate('click');
    });

    expect(completeSpy).to.have.been
      .calledTwice.and
      .calledWith(1).and
      .calledWith(2);
  });
});
