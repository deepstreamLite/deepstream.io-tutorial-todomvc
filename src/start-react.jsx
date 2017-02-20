var ds = deepstream( 'localhost:6020' )
ds.login({ username: 'ds-simple-input-' + ds.getUid() });

var emitter = new EventEmitter();


class ToDo extends React.Component{
  constructor(props) {
    super(props);
    var that=this;

    this.state = {
      todos:[],
      todosList:[],
      newTodo:''
    }
    var todosList = ds.record.getList('todos');

    var todos = this.state.todos;
    todosList.whenReady(()=> {
      var entries = todosList.getEntries();
      entries.forEach(function(item) {
        var obj = {};
        var rec = ds.record.getRecord(item);
        obj.id=item;
        rec.whenReady(()=> {
          obj.title = rec.get('title');
          obj.isDone = rec.get('isDone');
          todos.unshift(obj);
          that.setState({
            todos:todos
          })
        })
      })
    })

    this.handleKeyPress = this.handleKeyPress.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.componentDidMount = this.componentDidMount.bind(this);
  }



  componentDidMount() {
    emitter.addListener('user-selected', function( recordName ) {
      this.record.setName(recordName);
    }.bind(this));
  }

  render() {
    var todos = this.state.todos.map(function(item) {
      return (
        <div className="todoBox">
          <input className="checkbox" type="checkbox" name="check"/>
          <h4 className="todoText">{item.title}</h4>
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
  handleKeyPress(e) {
    var obj={};
    var todosList=this.state.todosList;
    var todos = this.state.todos;
    if(e.key == 'Enter') {
      if(this.state.newTodo.length>0) {

        this.setState({
          newTodo:''
        })
        var id = 'todo/' + ds.getUid();
        ds.record.getRecord( id ).set({
          title: this.state.newTodo,
          isDone: false
        });
        ds.record.getList('todos').addEntry(id);
        var rec = ds.record.getRecord(id);
        rec.whenReady(()=> {
          obj.id = id;
          obj.title = rec.get('title');
          obj.isDone = rec.get('isDone');
          todos.unshift(obj)
          this.setState({
            todos:todos
          })
        })
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
