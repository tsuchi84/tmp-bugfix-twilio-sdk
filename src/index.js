
let call_count = 0;
function increment() {
  const div_count = document.getElementById('count');
  div_count.innerText = ++call_count;
}

document.addEventListener('DOMContentLoaded', () => {
  const phone_number = document.getElementById('phone_number');
  const connect = document.getElementById('connect');
  const disconnect = document.getElementById('disconnect');
  const devices = document.getElementById('devices');

  connect.addEventListener('click', () => {
    const call_parameter = {
      to: phone_number.value,
      identity: process.env.TWILIO_CLIENT_USER,
      number: process.env.TWILIO_PHONE_NUMBER,
    };
    console.log('connect', call_parameter);
    Twilio.Device.connect(call_parameter);
  });

  phone_number.value = process.env.DEFAULT_CALL_NUMBER;

  disconnect.addEventListener('click', () => {
    Twilio.Device.disconnectAll();
  });

  devices.addEventListener('change', (e) => {
    const device_id = e.currentTarget.value;
    Twilio.Device.audio.speakerDevices.set([device_id]);
    console.log('device change', device_id);
  });

  fetch('/token')
    .then(response => response.text())
    .then(client_token => {
      Twilio.Device.setup(client_token, {
        closeProtection: true,
        debug: true,
        region: 'jp1',
        warnings: true,
      });

      Twilio.Device.ready(device => {
        console.log('ready');
        device.audio.availableOutputDevices.forEach(device => {
          const option = document.createElement('option');
          option.value = device.deviceId;
          option.innerText = device.label;
          devices.appendChild(option);
        });
      });

      Twilio.Device.connect(() => {
        console.log('connect');
        increment();
        connect.style.display = 'none';
        disconnect.style.display = 'inherit';
      });
      Twilio.Device.disconnect(() => {
        console.log('disconnect');
        connect.style.display = 'inherit';
        disconnect.style.display = 'none';
      });
      Twilio.Device.error((e) => {
        console.log(e.message);
      });
    });
});