var ds = deepstream( 'localhost:6020' )
ds.login({ username: 'ds-simple-input-' + ds.getUid() });


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
      trial:'trial',
      allChecked:false
    }

    this.handleKeyPress = this._handleKeyPress.bind( this );
    this.handleChange = this._handleChange.bind( this );
    this.showAll = this._showAll.bind( this );
    this.showActive = this._showActive.bind( this );
    this.showCompleted = this._showCompleted.bind( this );
    this.clearCompleted = this._clearCompleted.bind( this );
    this.initialCount = this.initialCount.bind( this );
    this.countLeftTodos = this.countLeftTodos.bind( this );
    this.toggleAll = this.toggleAll.bind( this );
  }

  _setEntries( entries ) {
    this.setState({
      todos: entries
    });
  }

  initialCount(left) {
    if(!left) {
      this.setState({
        counter:this.state.counter+1
      })
    }
  }

  countLeftTodos (wasChecked) {
    if(wasChecked) {
      this.setState({
        counter:this.state.counter-1
      })
    }
    else {
      this.setState({
        counter:this.state.counter+1
      })
    }
  }

  render() {
    var {todos, toShow, counter, allChecked, clearCompleted} = this.state;
    var {initialCount, countLeftTodos, list} = this;
    var downarrow;
    var todos = this.state.todos.map(function(recordName) {
      return (
        <TodoItem recordName={recordName}
          list={list} key={recordName}
          toShow={toShow}
          countLeftTodos={countLeftTodos}
          initialCount={initialCount}
          allChecked={allChecked}
          />
      )
    })
    if (todos.length) {
      downarrow = (
        <section className="main">
          <input
            className="toggle-all"
            type="checkbox"
            onChange={this.toggleAll}
            checked={allChecked}
            />
        </section>
      );
    }

    return (
      <div>
        <header className="header">
          <input
            className="new-todo"
            placeholder="What needs to be done?"
            value={this.state.newTodo}
            onKeyPress={this.handleKeyPress}
            onChange={this.handleChange}
            autoFocus={true}
            />
        </header>
        {downarrow}
        <div className="todos">
          {todos}
        </div>
        <div className="footer">
          <h4 className="itemsLeft"> {counter} items left</h4>
          <ul className="filters">
            <li><input type="Submit" value="All" className="footerButton" onClick={this.showAll}/></li>
            <li><input type="Submit" value="Active" className="footerButton" onClick={this.showActive}/></li>
            <li><input type="Submit" value="Completed" className="footerButton" onClick={this.showCompleted}/></li>
          </ul>
          <input type="Submit" value="Clear Completed"
            className={(this.state.todos.length!==this.state.counter || this.state.allChecked) ? "clear-completed":"nothingToClear" }
            onClick={this.clearCompleted}/>
        </div>
      </div>
    )
  }

  toggleAll(event) {
    if(event.target.checked==true) {
      this.setState({
        allChecked:true
      })

    }
    if(event.target.checked==false) {
      this.setState({
        allChecked:false
      })
    }
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
    this.setState({ newTodo:''
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
    if(this.state.allChecked==true) {
      this.setState({
        counter:0,
        allChecked:false
      })
      todos.forEach(function(recordName) {
        var rec = ds.record.getRecord(recordName);
        rec.whenReady(()=>{
          list.removeEntry(recordName);
          rec.delete();
        })
      })
    }
    else {
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
  }
};



class TodoItem extends React.Component{
  constructor(props) {
    super(props);
    this.record = ds.record.getRecord(this.props.recordName);
    this.record.subscribe(this.setState.bind(this), true);

    this.record.whenReady(()=>{
      this.props.initialCount(this.record.get('isDone'))
    })

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
    var {toShow, recordName, allChecked} = this.props;
    var {check, removeTodo, startEdit, handleSubmit, handleChange, handleKeyDown } = this;

    function whatToShow() {
      if(toShow=='all' || (isDone==false&&toShow=='active') ||
      (isDone==true&&toShow=='completed') ) {
        return (
          <li className="todoBox">
            <input className="toggle"
              name="done"
              type="checkbox"
              checked={allChecked ? true: isDone}
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
    if(this.state.isDone==false) {
      this.props.countLeftTodos(true)
    };
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
    }
    else if (event.keyCode === ENTER_KEY) {
      this.handleSubmit();
    }
  }
}



React.render(
  <div>
    <h1 id="headline">todos</h1>
    <div id="wrapper">
      <div>
        <ToDo />
      </div>
    </div>
  </div>,
  document.body
);
