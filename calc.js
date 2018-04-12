var plans = [];
$(document).ready(function () {
    $('table#result').hide();

    $.ajax({
        url: "https://yobit.io/ajax/system_investbox.php",
        cache: false,
        type: "POST",
        data: {
            action: "list_boxes",
            draw: 1,
            start: 0,
            length: 100
        },
        success: function (data) {
            $('#plans').html('<option>Select Investment plan</option>');
            var result = $.parseJSON(data);
            $.each(result.data, function (i, j) {
                var percent = parseFloat(j[0]),
                    period = j[1],
                    minInv = $(j[2]).text().trim(),
                    maxInv = $(j[3]).text().trim()
                    currency = $(j[5]).text().trim();

                maxInv = parseFloat(maxInv) > 0 ? maxInv : "Unlimited";
                plans.push({percent:percent, period:period, minInv:minInv, maxInv:maxInv});
                $('#plans').append('<option value="'+i+'">' + percent + '% ' + period + ' - ' + currency + ' - (min: ' + minInv + ', max: ' + maxInv + ')</option>');
            });

            if ($('#plans option').length > 0) {
                $('#plans').removeAttr('disabled');
            }
        }
    });

    $('#plans').on('change', function(){
        var planId = $('#plans option:selected').val();
        $('#amount').val(plans[planId].minInv);
        $('table#result').hide();
    });


    $('#calculate').on('click', function(){
        var planId = $('#plans option:selected').val(),
            amount = parseFloat($('#amount').val());

        if(plans[planId].minInv > amount || (plans[planId].maxInv != "Unlimited" && plans[planId].maxInv < amount)){
            alert('Wrong investment amount!');
        } else {
            $('table#result').show();
            $('table#result tbody').html('');

            var start = new Date(document.querySelector('[name="startdate"]').value),
                end = new Date(document.querySelector('[name="enddate"]').value),
                year = start.getFullYear(),
                month = start.getMonth(),
                day = start.getDate(),
                dates = [start],
                namount = amount;

            switch (plans[planId].period) {
                case 'Weekly':
                    var i = 0;
                    while (dates[dates.length - 1] < end) {
                        var dt = new Date(year, month, day++);
                        if((i % 7) === 0 && i > 1) {
                            var profit = parseFloat(namount * plans[planId].percent / 100);
                            namount = parseFloat(namount + profit);
                            $('table#result tbody').append('<tr><td>' + dt.toLocaleDateString() + '</td><td>' + namount.numberFormat(8,'.',' ') + '</td><td>' + profit.numberFormat(8,'.',' ') + '</td></tr>');
                            i = 0;
                        }
                        i++;
                        dates.push(dt);
                    }
                    break;

                case 'Monthly':
                    while (dates[dates.length - 1] < end) {
                        var dt = new Date(year, ++month, day),
                            profit = parseFloat(namount * plans[planId].percent / 100);
                            namount = parseFloat(namount + profit);
                        $('table#result tbody').append('<tr><td>' + dt.toLocaleDateString() + '</td><td>' + namount.numberFormat(8,'.',' ') + '</td><td>' + profit.numberFormat(8,'.',' ') + '</td></tr>');
                        dates.push(dt);
                    }
                    break;

                default:
                    while (dates[dates.length - 1] < end) {
                        var dt = new Date(year, month, ++day),
                            profit = parseFloat(namount * plans[planId].percent / 100);
                            namount = parseFloat(namount + profit);
                        $('table#result tbody').append('<tr><td>' + dt.toLocaleDateString() + '</td><td>' + namount.numberFormat(8,'.',' ') + '</td><td>' + profit.numberFormat(8,'.',' ') + '</td></tr>');
                        dates.push(dt);
                    }
                    break;
            }
        }
    });

});

Number.prototype.numberFormat = function(decimals, dec_point, thousands_sep) {
    dec_point = typeof dec_point !== 'undefined' ? dec_point : '.';
    thousands_sep = typeof thousands_sep !== 'undefined' ? thousands_sep : ',';
    var parts = this.toFixed(decimals).split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, thousands_sep);
    return parts.join(dec_point);
}