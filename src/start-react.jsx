var ds = deepstream( 'localhost:6020' )
ds.login({ username: 'ds-simple-input-' + ds.getUid() });

var emitter = new EventEmitter();



class ToDo extends React.Component{
  constructor(props) {
    super(props);
    this.list = ds.record.getList( 'todos' );
    this.list.subscribe(this._setEntries.bind( this ) );
    this.state = {
      todos:[],
      newTodo:'',
      toShow:'all',
      counter:0,
      trial:'trial'
    }
    this.handleKeyPress = this._handleKeyPress.bind( this );
    this.handleChange = this._handleChange.bind( this );
    this.showAll = this._showAll.bind( this );
    this.showActive = this._showActive.bind( this );
    this.showCompleted = this._showCompleted.bind( this );
    this.clearCompleted = this._clearCompleted.bind( this );
    this.componentDidMount = this.componentDidMount.bind( this );
    this.countLeftTodos = this.countLeftTodos.bind( this );
  }


  _setEntries( entries ) {
    this.setState({
      todos: entries
    });
  }

countLeftTodos (wasChecked) {
  var counter = this.state.counter;
  console.log('trying');
  if(wasChecked) {
    counter-=1;
  }
  else {
    counter+=1;
  }
  this.setState({
    counter:counter
  })
}
  componentDidMount() {
    var that = this;
    var counter = 0;
    var list = ds.record.getList( 'todos' );
    list.whenReady(()=> {
      var entries = list.getEntries();
      entries.forEach(function(todo) {
        var rec = ds.record.getRecord(todo);
        rec.whenReady(()=>{
          if(rec.get('isDone')==false) {
            counter+=1;
            that.setState({
              counter:counter
            })
          }
        })
      })
    })
  }


  render() {
    var counter = this.state.counter;
    var countLeftTodos = this.countLeftTodos;
    var todos = this.state.todos;
    var list = this.list;
    var toShow = this.state.toShow;
    var todos = this.state.todos.map(function(recordName) {
      return (
        <TodoItem recordName={recordName}
          list={list} key={recordName}
          toShow={toShow}
          countLeftTodos={countLeftTodos}
          />
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
        <div className="footer">
          <h4 className="itemsLeft"> {counter} items left</h4>
          <button className="footerButton" onClick={this.showAll}>All</button>
          <button className="footerButton" onClick={this.showActive}>Active</button>
          <button className="footerButton" onClick={this.showCompleted}>Completed</button>
          <button className="footerButton" onClick={this.clearCompleted}>Clear Completed</button>
        </div>
      </div>
    )
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
    this.setState({ newTodo:'',
      counter:this.state.counter+1
     });
  }

  _handleChange(e) {
    this.setState({newTodo:e.target.value});
  }

  _showAll() {
    this.setState({
      toShow:'all'
    })
  }

  _showActive () {
    this.setState({
      toShow:'active'
    })
  }

  _showCompleted() {
    this.setState({
      toShow:'completed'
    })
  }

  _clearCompleted() {
    var list = this.list;
    var todos = this.state.todos;
    todos.forEach(function(recordName) {
      var rec = ds.record.getRecord(recordName);
      rec.whenReady(()=>{
        if(rec.get('isDone')==true) {
          list.removeEntry(recordName);
          rec.delete();
        }
      })
    })
  }
};




class TodoItem extends React.Component{
  constructor(props) {
    super(props);
    this.record = ds.record.getRecord(this.props.recordName);
    this.record.subscribe(this.setState.bind(this), true);
    this.removeTodo = this._removeTodo.bind( this );
    this.check = this._check.bind( this );
    this.startEdit = this.startEdit.bind( this );
    this.handleSubmit = this.handleSubmit.bind( this );
    this.handleKeyDown = this.handleKeyDown.bind( this );
    this.handleChange = this.handleChange.bind( this );


    this.state = {
      title:'',
      isDone:false,
      editedText:'',
      toEdit:false
    }
  }

  render () {
    var {isDone, title, handleEdit, toEdit, editedText} = this.state;
    var {toShow, recordName} = this.props;
    var {check, removeTodo, startEdit, handleSubmit, handleChange, handleKeyDown } = this;

    function whatToShow() {
      if(toShow=='all' || (isDone==false&&toShow=='active') ||
      (isDone==true&&toShow=='completed') ) {
        return (
          <li className="todoBox">
            <input className="toggle"
              name="done"
              type="checkbox"
              checked={isDone}
              onChange={check}/>
              <label id={recordName}
                className={isDone ? 'doneTodo' : 'todoText'}
                onDoubleClick={startEdit}
                >{title}</label>
              <input
                ref="editField"
                className="editInput"
                className={toEdit ? 'edit' : 'noEdit'}
                value={editedText}
                onBlur={handleSubmit}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                />
            <button className="destroy" onClick={removeTodo} />
          </li>
        )
      }
    }

    return (
      <div>
        {whatToShow()}
      </div>
    )
  }
  _removeTodo() {
    this.props.list.removeEntry( this.record.name );
    this.record.delete();
    this.props.countLeftTodos(true);

  }

  _check (event) {
    this.props.countLeftTodos(event.target.checked);
    if(event.target.checked==true) {
      this.record.set('isDone', true);
      this.setState({
        isDone:true
      })
    }

    if(event.target.checked==false) {
      this.record.set('isDone', false);
      this.setState({
        isDone:false
      })
    }
  }


  startEdit() {
    console.log('double click')
    console.log(this.refs.editField)
    this.setState({
      toEdit: true,
      editedText: this.state.title
    });
  }

  handleChange(event) {
    this.setState({editedText: event.target.value});
  }

  handleSubmit() {
    var val = this.state.editedText.trim();
    if( val ) {
      this.setState({
        toEdit: false,
        title: this.state.editedText
      });
      var title = this.state.editedText;
      this.record.set('title', title);
    }
    else {
      this.setState({
        toEdit: false
      });
    }
  }

  handleKeyDown(event) {
    var ESCAPE_KEY = 27;
    var ENTER_KEY = 13;
    if (event.keyCode === ESCAPE_KEY) {
      this.setState({
        toEdit: false
      });
    } else if (event.keyCode === ENTER_KEY) {
      this.handleSubmit();
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
