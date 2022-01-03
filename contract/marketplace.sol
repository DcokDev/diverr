// SPDX-License-Identifier: MIT

pragma solidity >=0.7.0 <0.9.0;

interface IERC20Token {
    function transfer(address, uint256) external returns (bool);

    function approve(address, uint256) external returns (bool);

    function transferFrom(
        address,
        address,
        uint256
    ) external returns (bool);

    function totalSupply() external view returns (uint256);

    function balanceOf(address) external view returns (uint256);

    function allowance(address, address) external view returns (uint256);

    event Transfer(address indexed from, address indexed to, uint256 value);
    event Approval(
        address indexed owner,
        address indexed spender,
        uint256 value
    );
}

contract Services {
    uint256 internal postsLength = 0;
    uint256 internal messagesLength = 0;
    address internal cUsdTokenAddress =
        0x874069Fa1Eb16D44d622F2e0Ca25eeA172369bC1;

    struct User {
        address id;
        string name;
        uint256[] posts;
    }

    struct Post {
        address payable creator;
        uint256 category;
        uint256 price;
        string title;
        string description;
        uint256[] stars;
        address[] buyers;
        
    }

    struct Message {
        address sender;
        string content;
        string contact;
        uint256 postId;
    }

    mapping(uint256 => Post) internal posts;

    mapping(address => User) internal users;

    mapping(uint256 => uint256[]) internal messagesIndexes;

    mapping(uint256 => Message) internal messages;

    modifier isServiceOwner(uint _id){
        bool yes = false;
        for (uint i = 0; i < users[msg.sender].posts.length; i++)
            if (_id == users[msg.sender].posts[i]){
                yes = true;
                break;
            }
        
        if (! yes) {revert();}
        _;
    }

    modifier notOwner(uint _id){
        require(posts[_id].creator != msg.sender, "action restricted");
        _;
    }

    function postService(
        string memory _title,
        string memory _description,
        uint256 _category,
        uint256 _price
    ) public {
        require(users[msg.sender].id == msg.sender, "First need to register");
        uint256[] memory _stars;
        address[] memory _buyers;
        posts[postsLength] = Post(
            payable(msg.sender),
            _category,
            _price,
            _title,
            _description,
            _stars,
            _buyers
        );
        users[msg.sender].posts.push(postsLength);
        postsLength++;
    }

    function registerUser(string memory _name) public {
        uint256[] memory _posts;
        users[msg.sender] = User(msg.sender, _name, _posts);
    }

    function reviewService(uint256 _index, uint256 _stars) public notOwner(_index) {
        posts[_index].stars.push(_stars);
    }

    function changePriceOfService(uint256 post_id, uint new_price) isServiceOwner(post_id) public {
        // simple function that allows the owner of a service to change the price of the service
        posts[post_id].price = new_price;
    }

    function getPost(uint256 _index)
        public
        view
        returns (
            address payable,
            string memory,
            string memory,
            uint256,
            uint256[] memory,
            address[] memory,
            uint256
        )
    {
        return (
            posts[_index].creator,
            posts[_index].title,
            posts[_index].description,
            posts[_index].category,
            posts[_index].stars,
            posts[_index].buyers,
            posts[_index].price
        );
    }

    function getUser(address _profile)
        public
        view
        returns (
            address,
            string memory,
            uint256[] memory
        )
    {
        return (
            users[_profile].id,
            users[_profile].name,
            users[_profile].posts
        );
    }

    function hireService(
        uint256 _index,
        string memory _message,
        string memory _contact
    ) public payable notOwner(_index){
        
        require(
            IERC20Token(cUsdTokenAddress).transferFrom(
                msg.sender,
                posts[_index].creator,
                posts[_index].price
            ),
            "Transfer failed."
        );
        posts[_index].buyers.push(msg.sender);
        messagesIndexes[_index].push(messagesLength);
        messages[messagesLength] = Message(
            msg.sender,
            _message,
            _contact,
            _index
        );
    }

    function getMessages(uint256 _index)
        public
        view
        returns (uint256[] memory)
    {
        return (messagesIndexes[_index]);
    }

    function getMessage(uint256 _index)
        public
        view
        returns (
            address,
            string memory,
            string memory,
            uint256
        )
    {
        return (
            messages[_index].sender,
            messages[_index].content,
            messages[_index].contact,
            messages[_index].postId
        );
    }

    function getPostsLength() public view returns (uint256) {
        return (postsLength);
    }
}
