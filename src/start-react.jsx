var ds = deepstream( 'localhost:6020' )
ds.login({ username: 'ds-simple-input-' + ds.getUid() });

var emitter = new EventEmitter();


class ToDo extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      todos:[],
      newTodo:''
    }
    this.list = ds.record.getList( 'todos' );
    this.list.subscribe(this._setEntries.bind( this ) );

    this.handleKeyPress = this._handleKeyPress.bind( this );
    this.handleChange = this._handleChange.bind( this );
  }

  _setEntries( entries ) {
    this.setState({todos: entries});
  }

  render() {
    var list = this.list;
    var todos = this.state.todos.map(function(recordName) {
      return (
        <TodoItem recordName={recordName} list={list} key={recordName}/>
      )
    })

    return (
      <div>
        <header className="header">
        						<h1 id="headline">todos</h1>

        						<input
        							className="new-todo"
        							placeholder="What needs to be done?"
        							value={this.state.newTodo}
                      onKeyPress={this.handleKeyPress}
        							onChange={this.handleChange}
        							autoFocus={true}
        						/>
        					</header>
        <div className="todos">
          {todos}
        </div>

      </div>
    );
  }

  _handleKeyPress(e) {
    if(e.key === 'Enter' && this.state.newTodo.length > 0 ) {
      this._addTodo();
    }
  }

  _addTodo() {
    var id = 'todo/' + ds.getUid();
    ds.record.getRecord(id).set({
      title: this.state.newTodo,
      isDone: false
    });
    this.list.addEntry( id );
    this.setState({ newTodo:'' });
  }

  _handleChange(e) {
    this.setState({newTodo:e.target.value});
  }
};

class TodoItem extends React.Component{
  constructor(props) {
    super(props);
    this.record = ds.record.getRecord(this.props.recordName);
    this.record.subscribe(this.setState.bind(this), true);
    this.removeTodo = this._removeTodo.bind( this );
    this.check = this._check.bind( this );

    this.state = {
      title:'',
      isDone:false
    }
  }

  render () {
    return (
      <li className="todoBox">
        <input className="toggle"
          name="done"
          type="checkbox"
          checked={this.state.done}
          onChange={this.check}/>
        <label id={this.props.recordName}
          className={this.state.isDone ? 'doneTodo' : 'todoText'}>{this.state.title}</label>
        <button className="destroy" onClick={this.removeTodo} />
      </li>
    )
  }


  _removeTodo() {
    this.props.list.removeEntry( this.record.name );
    this.record.delete();
  }

  _check (event) {
    if(event.target.checked==true) {
      this.setState({
        isDone:true
      })
    }

    if(event.target.checked==false) {
      this.setState({
        isDone:false
      })
    }
  }

}


React.render(
  <div id="wrapper">
    <div>
      <ToDo />
    </div>
  </div>,
  document.body
);
