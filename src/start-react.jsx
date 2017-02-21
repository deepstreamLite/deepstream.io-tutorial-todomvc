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
        <h4>What is there to do</h4>
        <input type="text" className="todoInput" value={this.state.newTodo}
           onChange={this.handleChange} onKeyPress={this.handleKeyPress}/>
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
    this.state = {
      title:'',
      isDone:false
    }
  }

  render () {
    return (
      <div className="todoBox">
        <input id={'inp/' + this.props.recordName}
          className="checkbox"
          type="checkbox"
          name="done"/>
        <h4 id={this.props.recordName} className="todoText">{this.state.title}</h4>
        <button className="destroy" onClick={this.removeTodo} />
      </div>
    )
  }

  _removeTodo() {
    this.props.list.removeEntry( this.record.name );
    this.record.delete();
  }
}

React.render(
  <div id="wrapper">
    <div className="col right">
      <ToDo />
    </div>
  </div>,
  document.body
);
