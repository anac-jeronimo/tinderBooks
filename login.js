currentUser = {};

function setCurrentUser(user) {
  currentUser = user;
  stateView();
}

function inputEnter(event, input) {
  const char = event.code;
  const key = event.key;
  if (char === "Enter" || key === "Enter") {
    if (input === "login") {
      getUserByUsername();
    } else if (input === "booksearch") {
      getBooksFromGoogle();
    }
  }
}

function stateView() {
  if (currentUser.id != undefined) {
    $("#login").addClass("d-none");
    $("#main").removeClass("d-none");
    updateHeader();
  } else {
    $("#login ").removeClass("d-none");
    $("#main ").addClass("d-none");
  }
}

function updateHeader() {
  $("#currentUsername").html(`Welcome ${currentUser.username}`);
}

function getUserByUsername() {
  let username = $("#username-input").val();
  $.get(
    'https://upacademytinder.herokuapp.com/api/users/?filter={"where":{"username":"' +
      username +
      '"},"include":"books"}'
  )
    .done((data) => {
      data.length == 0 ? addUser(username) : setCurrentUser(data[0]);
    })
    .fail((err) => {
      console.error("Erro : ", err);
    });
}

function addUser(username) {
  let tempUser = {
    username: username,
  };
  $.post("https://upacademytinder.herokuapp.com/api/users", tempUser)
    .done((data) => {
      setCurrentUser(data);
    })
    .fail((err) => {
      console.error("Erro : ", err);
    });
}

function deleteUserById() {
  $.ajax({
    url: "https://upacademytinder.herokuapp.com/api/users/" + currentUser.id,
    type: "DELETE",
    success: () => {
      console.log("Deleted ");
      setCurrentUser();
    },
  });
}

function updateUserById() {
  currentUser.username = $("#currentUsername ").val();
  $.ajax({
    url: "https://upacademytinder.herokuapp.com/api/users/" + currentUser.id,
    type: "PUT",
    data: currentUser,
    success: (user) => {
      console.log("Updated ");
      setCurrentUser(user);
    },
  });
}

function addBook() {
  let tempBook = {
    name: $("#bookName ").val(),
  };
  $.post(
    "https://upacademytinder.herokuapp.com/api/users/" +
      currentUser.id +
      "/books",
    tempBook
  )
    .done((data) => {
      console.log(data);
    })
    .fail((err) => {
      console.error("Erro : ", err);
    });
}

function getBooksFromGoogle() {
  console.log("getBooksFromGoogle function", $("#h-search").val());
}

function logout() {
  currentUser = {};
  stateView();
}

$("form").submit();


stateView();