

function unlockAccount() {

    var guid = $('#txtguid').val();
    var token = $('#txtToken').val();

    Ninki.API.unlockaccount(guid, token, function (err, res) {

        if (!err) {
            $('#unlockaccmess').show();
            $('.previous').hide();
            $('.next').hide();
        }

    });
}


function recover2fa() {

    //get bitcoin keys from mnemonics
    //sign the guid with cold key and hot key
    //hash the guid
    //pass signatures to server

    //txtguid
    //txtCold
    //txtHot

    var guid = $('#txtguid').val();
    //var hotKey = $('#txtHot').val();
    var coldKey = $('#txtCold').val();
    var token = $('#txtToken').val();
    //var hotsign = $('#txtHotSign').val();
    var coldsign = $('#txtColdSign').val()


    var eng = new Ninki.Engine();

    //hash the guid(
    //eng.signMessage(hotKey, guid, function (err, hotres) {

    eng.signMessage(coldKey, guid, function (err, colres) {

        //if (hotsign.length > 0) {
        //    hotres = hotsign;
        //}

        if (coldsign.length > 0) {
            colres = coldsign;
        }

        $('#unlockaccmess').show();

        $('#unlockaccmess').val(colres);



//        Ninki.API.resettwofactor(guid, '', colres, token, function (err, res) {

//            $('#unlockaccmess').hide();

//            if (!err) {
//                $('#reset2famess').show();
//                $('.previous').hide();
//                $('.next').hide();
//            }
//            //$('#reset2famess').html(res);
//            // console.log(res);

//        });

    });

    //});

}

var resetkey = '';
var message1 = '';
var message2 = '';

function recoverPassword() {


    $('#reset2famess').hide();
    $('#unlockaccmess').hide();

    var guid = $('#txtguid').val();
    var hotKey = $('#txtHot').val();
    var coldKey = $('#txtCold').val();
    var token = $('#txtToken').val();

    var eng = new Ninki.Engine();

    //hash the guid(
    eng.signMessage(hotKey, guid, function (err, hotres) {

        eng.signMessage(coldKey, guid, function (err, colres) {

            message1 = hotres;
            message2 = colres;

            Ninki.API.getpasswordresetkey(guid, hotres, colres, token, function (err, res) {

                console.log(res);

                var passkeys = JSON.parse(res);

                eng.getPassKey(hotKey, coldKey, passkeys.RecPacket, passkeys.RecPacketIV, function (err, result) {


                    if (!err) {
                        console.log(result);
                        resetkey = result;


                        $('#newpwd-container').show();

                    }

                });

            });

        });

    });

}

$(document).ready(function () {


    $("#newpassword1").blur(function () {
        $(".popover.fade.bottom.in").hide();
    });


    var optionschng = {};
    optionschng.ui = {
        container: "#newpwd-container",
        showVerdictsInsideProgressBar: true,
        showPopover: true,
        showErrors: true,
        viewports: {
            progress: ".newpwstrength_viewport_progress"
        }
    };
    optionschng.common = {
        debug: true,
        onLoad: function () {
            $('#messages').text('Start typing password');
        },
        onKeyUp: function () {
            //$("#createwalletalert").fadeOut(100);
        }
    };

    $('#newpassword1').pwstrength(optionschng);


    $('#btnChangePassword').click(function () {


        var guid = $('#txtguid').val();

        var twofactor = $('#twofactor').val();

        var eng = new Ninki.Engine();

        var hotkey = $('#txtHot').val();
        var hotkeydecode = eng.decodeKey(hotkey);

        $("#chngpwssuc").hide();
        $("#chngpwerr").hide();
        $("#chngpwdprog").hide();
        $("#chngpwdprogbar").width('0%');

        var newpassword = $("#newpassword1").val();
        var oldpassword = resetkey;
        var twoFactorCode = $("#txtTwoFactorCodeForChangePwd").val();

        if ($("#frmpwdchange").parsley('validate')) {

            $("#chngpwdprog").show();
            $("#chngpwdprogmess").show();
            $("#chngpwdprogbar").width('10%');
            $("#chngpwdprogmess").html('Getting packet...');


            if (oldpassword != newpassword) {

                //check password strength
                if (($(".newpwstrength_viewport_progress .password-verdict").html() == 'Strong' || $(".newpwstrength_viewport_progress .password-verdict").html() == 'Very Strong')) {

                    //stretch old password
                    //verify that it matches the current one
                    $("#chngpwdprogbar").width('20%');
                    $("#chngpwdprogmess").html('Getting details...');

                    setTimeout(function () {

                        eng.ResetPassword(guid, twofactor, resetkey, newpassword, "#chngpwdprogbar", "#chngpwdprogmess", hotkeydecode, message1, message2, function (err, results) {

                            if (err) {
                                $("#chngpwerr").show();
                                $("#chngpwerrmess").html(results);
                                $("#chngpwdprogmess").hide();
                                $("#chngpwdprog").hide();

                            } else {

                                password = results;

                                $("#chngpwerr").hide();
                                $("#chngpwdprogbar").width('100%');
                                $("#chngpwdprog").hide();
                                $("#chngpwdprogmess").hide();
                                $("#chngpwdprogbar").hide();
                                $("#chngpwssuc").show();

                                $("#newpassword1").val('');
                                $("#newpassword2").val('');
                                $("#oldpwd").val('');
                                $("#txtTwoFactorCodeForChangePwd").val('');
                                $("#newpwd-container").hide();
                                $(".previous").hide();
                            }

                        });


                    }, 500);
                }

            } else {
                $("#chngpwerr").show();
                $("#chngpwerrmess").html("Passwords are the same. Password not updated");
                $("#chngpwdprogmess").hide();
                $("#chngpwdprog").hide();
            }

        }


    });


    var step = 1;
    $("#step1").show();
    $("#prgsecwiz").width('25%');
    $(".previous").hide();
    $(".next").click(function () {


        if (step == 3) {


            var valid = true;
            if ($('#optPassword:checked').length > 0) {
                recoverPassword();
            } else if ($('#opt2fa:checked').length > 0) {
                recover2fa();
            } else if ($('#optUnlock:checked').length > 0) {

            } else {
                valid = false;
            }

            if (valid) {
                $("#step5").show();
                $("#step3").hide();
                $("#listep3").removeClass("active");
                $("#listep5").addClass("active");
                $("#prgsecwiz").width('100%');
                $(".next").hide();
                $(".previous").show();
                step++;
            }



        }

//        if (step == 3) {
//            $("#step4").show();
//            $("#step3").hide();
//            $("#listep3").removeClass("active");
//            $("#listep4").addClass("active");
//            $("#prgsecwiz").width('80%');
//            $(".next").show();
//            $(".previous").show();
//            step++;



//        }

        if (step == 2) {

            if ($('#optUnlock:checked').length > 0) {

                $("#step5").show();
                $("#step2").hide();
                $("#listep2").removeClass("active");
                $("#listep5").addClass("active");
                $("#prgsecwiz").width('100%');
                $(".next").show();
                $(".previous").show();
                step = 5;
                unlockAccount();

            } else {

                $("#step3").show();
                $("#step2").hide();
                $("#listep2").removeClass("active");
                $("#listep3").addClass("active");
                $("#prgsecwiz").width('60%');
                $(".next").show();
                $(".previous").show();
                step++;
            }
        }

        if (step == 1) {


            //send a token to email address
            var guid = $('#txtguid').val();
            Ninki.API.getResetToken(guid, function (err, res) {

                if (!err) {
                    $("#step2").show();
                    $("#step1").hide();
                    $("#listep1").removeClass("active");
                    $("#listep2").addClass("active");
                    $("#prgsecwiz").width('40%');
                    $(".previous").show();

                    step++;
                }

            });



        }

    });

    $(".previous").click(function () {

        if (step == 2) {
            $("#step1").show();
            $("#step2").hide();
            $("#listep2").removeClass("active");
            $("#listep1").addClass("active");
            $("#prgsecwiz").width('20%');
            $(".previous").hide();
            $(".next").show();
            step--;
        }

        if (step == 3) {
            $("#step2").show();
            $("#step3").hide();
            $("#listep3").removeClass("active");
            $("#listep2").addClass("active");
            $("#prgsecwiz").width('40%');
            $(".previous").show();
            $(".next").show();
            step--;
        }

        if (step == 4) {
            $("#step3").show();
            $("#step4").hide();
            $("#listep4").removeClass("active");
            $("#listep3").addClass("active");
            $("#prgsecwiz").width('60%');
            $(".previous").show();
            $(".next").show();
            step--;
        }

        if (step == 5) {


            $("#step5").hide();

            if ($('#optUnlock:checked').length > 0) {


                $("#step2").show();
                $("#step5").hide();
                $("#listep5").removeClass("active");
                $("#listep2").addClass("active");
                $("#prgsecwiz").width('40%');
                $(".previous").show();
                $(".next").show();
                $('#newpwd-container').hide();
                step = 2;


            } else {

                $("#step4").show();
                $("#step5").hide();
                $("#listep5").removeClass("active");
                $("#listep4").addClass("active");
                $("#prgsecwiz").width('80%');
                $(".previous").show();
                $(".next").show();
                $('#newpwd-container').hide();
                step--;

            }
        }


    });

});
