// Dostaffkin — отслеживание доставки. Реализация по заметкам дня 4.
const trackButton = document.getElementById('trackButton');
const trackResult = document.getElementById('trackResult');
const trackNumber = document.getElementById('trackNumber');
const trackIdValue = document.getElementById('trackIdValue');
const trackFromValue = document.getElementById('trackFromValue');
const trackToValue = document.getElementById('trackToValue');
const trackStatusList = document.getElementById('trackStatusList');

// Обработчик кнопки «Отследить».
trackButton.addEventListener('click', () => {
  if (!trackNumber.value || trackNumber.value.trim() === '') {
    alert('Заполните номер отправления');
    trackResult.classList.toggle('is-visible', false);
    trackResult.hidden=true;
    return;
  }

  const number=Number(trackNumber.value.trim());

  // Сначала ищем созданную на этом компьютере заявку.
  let savedOrder=null;
  try {
    const orders=JSON.parse(localStorage.getItem('dostaffkinOrders')||'{}');
    savedOrder=orders[String(number)]||null;
  } catch(error) { /* если localStorage недоступен, показываем тестовые данные */ }

  // Для тестовых отправлений действует диапазон из заметок.
  // Собственные номера заявки принимаются и за пределами диапазона.
  if (!Number.isInteger(number) || (!savedOrder && (number < 1000 || number > 10000))) {
    alert('К сожалению, мы не смогли найти отправление по данному номеру');
    trackResult.classList.toggle('is-visible', false);
    trackResult.hidden=true;
    return;
  }

  // Тестовые данные по отправлению — структура из заметок дня 4.
  const response = savedOrder ? {
    id:String(number),
    route:{
      from:savedOrder.route?.from || savedOrder.from || 'Москва, улица Арбат, 1',
      to:savedOrder.route?.to || savedOrder.to || 'Минск, проспект Независимости, 58'
    },
    statuses:[
      {type:'created',label:'Создан',date:savedOrder.createdAt||'Сегодня'},
      {type:'in-way',label:'В пути',date:'Ожидает обновления'}
    ]
  } : {
    id:trackNumber.value.trim(),
    route:{
      from:'Москва, улица Арбат, 1',
      to:'Минск, проспект Независимости, 58'
    },
    statuses:[
      {type:'created',label:'Создан',date:'10.01.2026'},
      {type:'in-way',label:'В пути: Вязьма',date:'15.01.2026'},
      {type:'in-way',label:'В пути: Орша',date:'16.01.2026'},
      {type:'in-way',label:'В пути: Минск',date:'18.01.2026'},
      {type:'ready',label:'Готов к выдаче',date:'25.01.2026'},
      {type:'done',label:'Вручен',date:'27.01.2026'}
    ]
  };

  trackResult.classList.toggle('is-visible',true);
  trackResult.hidden=false;
  trackIdValue.textContent=`№${response.id}`;
  trackFromValue.textContent=`Откуда: ${response.route.from}`;
  trackToValue.textContent=`Куда: ${response.route.to}`;
  renderStatuses(response.statuses);
});

// Рендерим список статусов в ленте — по заметкам урока.
function renderStatuses(statuses) {
  trackStatusList.innerHTML='';
  statuses.forEach(status => {
    const item=document.createElement('div');
    item.className=`track-status ${status.type}`;

    const icon=document.createElement('img');
    icon.className='track-status-icon';
    icon.src=`./images/icons/${status.type}.svg`;
    icon.alt='';

    const text=document.createElement('div');
    text.className='track-status-text';

    const state=document.createElement('div');
    state.className='track-status-text-state';
    state.textContent=status.label;

    const date=document.createElement('div');
    date.className='track-status-text-date';
    date.textContent=status.date;

    text.append(state,date);
    item.append(icon,text);
    trackStatusList.appendChild(item);
  });
}
