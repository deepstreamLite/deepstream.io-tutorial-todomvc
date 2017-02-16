var ds = deepstream( 'localhost:6020' )
ds.login({ username: 'ds-simple-input-' + ds.getUid() });

var emitter = new EventEmitter();




var UserDetails = React.createClass({
  getInitialState: function() {
    var that=this;
    var todosList = ds.record.getList('todos');
    todosList.whenReady(()=> {
      this.todosList = todosList;
      this.todos = todosList.getEntries();
      var list = [];
      var obj = {};
      for (var i=0;i<this.todos.length;i++) {
        obj.name=this.todos[i];
        var rec = ds.record.getRecord(this.todos[i]);
        rec.whenReady((rec) => {
          var that=this;
          obj.title = rec.get('title');
          obj.isDone = rec.get('isDone');
          list.push(obj);
        })
      }
this.list = list;
console.log(list)
    })

    return {newTodo: ''
            }
  },
  componentDidMount: function() {
    emitter.addListener('user-selected', function( recordName ) {
      this.record.setName(recordName);
    }.bind(this));
  },
  render: function() {
    console.log(this);

    return (
      <div>
        <h3>What is there to do</h3>
        <textArea value={this.state.newTodo} onKeyPress={this.handleKeyPress} onChange={this.handleChange}></textArea>

      </div>
    );
  },
  handleKeyPress: function(event) {
    var that=this;
    var todos = that.todos;
    var todosList = that.todosList;
    if(event.key == 'Enter') {
      console.log('enter pressed');
      console.log(that.state.newTodo);
      var id = 'todo/' + ds.getUid();
      ds.record.getRecord( id ).set({
        title: that.state.newTodo,
        isDone: false
      });
      console.log(ds.record.getRecord(id))
      todosList.addEntry(id);
      console.log(todosList._record._$data);
    }
  },
  handleChange: function(event) {
    this.setState({newTodo:event.target.value})
  }

});









React.render(
  <div id="wrapper">
    <div className="col right">
      <UserDetails />
    </div>
  </div>,
  document.body
);
