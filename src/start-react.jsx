var ds = deepstream( 'localhost:6020' )
ds.login({ username: 'ds-simple-input-' + ds.getUid() });

var emitter = new EventEmitter();


class UserDetails extends React.Component{
  constructor(props) {
    super(props);
    var that=this;
    var todosList = ds.record.getList('todos');
    todosList.setEntries([]);


    this.state = {
      todos:[],
      todosList:todosList,
      newTodo:'',
    }

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
        <textArea className="todoInput" value={this.state.newTodo} onKeyPress={this.handleKeyPress} onChange={this.handleChange}></textArea>
        <div className="todos">
          {todos}
        </div>
      </div>
    );
  }
  handleKeyPress(event) {
    var obj={};
    var todosList=this.state.todosList;
    var todos = this.state.todos;
    if(event.key == 'Enter') {
      console.log('enter pressed');
      console.log(this.state.newTodo);
      this.setState({
        newTodo:''
      })
      var id = 'todo/' + ds.getUid();
      ds.record.getRecord( id ).set({
        title: this.state.newTodo,
        isDone: false
      });
      todosList.addEntry(id);
      var rec = ds.record.getRecord(id);
      rec.whenReady(()=> {
        obj.title = rec.get('title');
        obj.isDone = rec.get('isDone');
        todos.push(obj)
        this.setState({
          todos:todos
        })
        console.log(this.state.todos)
      })
    }
  }
  handleChange(event) {
    this.setState({newTodo:event.target.value})
  }
};


React.render(
  <div id="wrapper">
    <div className="col right">
      <UserDetails />
    </div>
  </div>,
  document.body
);
