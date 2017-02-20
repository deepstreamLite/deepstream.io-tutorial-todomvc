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
    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);

  }

  componentDidMount() {
    var todos = this.state.todos;
    var that=this;
    var list = ds.record.getList( 'todos' );
    list.whenReady(()=> {
      var entries = list.getEntries();
      entries.forEach(function(item) {
        var obj = {};
        var rec = ds.record.getRecord(item);
        obj.id=item;
        rec.whenReady(()=> {
          obj.title = rec.get('title');
          obj.isDone = rec.get('isDone');
          todos.push(obj);
          that.setState({
            todos:todos
          })
        })
      })
    })

    emitter.addListener('todo-added', function( recordName ) {
      var todos=that.state.todos;
      var obj={}
      var rec = ds.record.getRecord(recordName);
      rec.whenReady(()=> {
        obj.id = recordName;
        obj.title = rec.get('title');
        obj.isDone = rec.get('isDone');
        todos.push(obj)
        that.setState({
          todos:todos
        })
      })
      list.addEntry( recordName );
    });

    emitter.addListener('delete-todo', function( recordName ) {
      var todos=that.state.todos;
      todos.forEach(function(item,i) {
        if(item.id==recordName) {
          todos.splice(i,1);
          that.setState({
            todos:todos
          })
        }
      })
      list.removeEntry( recordName );
    });
  }

  render() {
    var that=this;
    var todos = this.state.todos.map(function(item) {
      return (
        <div className="todoBox">
          <input id={'inp/' + item.id}
            className="checkbox"
            type="checkbox"
            name="done"
            checked={that.state.done}
            onChange={that.handleInputChange}/>
          <h4 id={item.id} className="todoText">{item.title}</h4>
            <button id={item.id} className="destroy" onClick={that.removeTodo} />
        </div>
      )
    })

    return (
      <div>
        <h4>What is there to do</h4>
        <textArea className="todoInput" value={this.state.newTodo}
          onKeyPress={this.handleKeyPress} onChange={this.handleChange}></textArea>
        <div className="todos">
          {todos}
        </div>

      </div>
    );
  }

  handleInputChange(event) {
  console.log(event.target.checked)
  }

  removeTodo(e) {
    var id=e.target.id;
    emitter.emit('delete-todo', id);
  }
  handleKeyPress(e) {
    var obj={};
    var todos = this.state.todos;
    if(e.key == 'Enter') {
      if(this.state.newTodo.length>0) {
        this.setState({
          newTodo:''
        })
        var id = 'todo/' + ds.getUid();
        ds.record.getRecord(id).set({
          title: this.state.newTodo,
          isDone: false
        });
        emitter.emit('todo-added', id);
      }
    }
  }
  handleChange(e) {
    this.setState({newTodo:e.target.value})
  }
};



React.render(
  <div id="wrapper">
    <div className="col right">
      <ToDo />
    </div>
  </div>,
  document.body
);
