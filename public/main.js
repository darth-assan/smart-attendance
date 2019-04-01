$(document).ready(function(){
    $('.delete-user').on('click',function(e){
        $target = $(e.target);
        const id = $target.attr('data-id');
        $.ajax({
            type:'DELETE',
            url: '/users/delete/'+id,
            success: function(response){
                alert('User Deleted ');
                window.location.href('/users/admin')
            },
            error: function(err){
                console.log(err);
            }
        })
    })
    // $('.delete-course').on('click',function(e){
    //     $target = $(e.target);
    //     const id = $target.attr('data-id');
    //     $.ajax({
    //         type:'DELETE',
    //         url: '/users/delete-course/'+id,
    //         success: function(response){
    //             alert('Course Deleted ');
    //             window.location.href('/users/admin')
    //         },
    //         error: function(err){
    //             console.log(err);
    //         }
    //     })
    // })
});
