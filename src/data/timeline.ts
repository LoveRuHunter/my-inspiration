import type { TimelineEvent } from '@/lib/types';

/**
 * Ключевые события галактики, привязанные к планетам и эпохам.
 * Все даты и участники — по каноническому Диснеевскому канону.
 */
export const TIMELINE: TimelineEvent[] = [
  // ============================================================
  // Старая Республика
  // ============================================================
  {
    id: 'dantooine-jedi-enclave',
    eraId: 'old-republic',
    year: '≈ 4000 ДБЯ',
    title: 'Джедайский анклав на Дантуине',
    planetIds: ['dantooine'],
    characterIds: ['revan'],
    summary:
      'В эпоху Мандалорских войн Дантуин служил тихой академией Ордена. Здесь обучались Реван и Малак — до того, как оба пали во тьму.',
  },

  // ============================================================
  // Войны клонов (и события 32 ДБЯ)
  // ============================================================
  {
    id: 'boonta-eve-podrace',
    eraId: 'clone-wars',
    year: '32 ДБЯ',
    title: 'Гонка на подах Бунта-Ив',
    planetIds: ['tatooine'],
    characterIds: ['anakin', 'obi-wan', 'jabba'],
    summary:
      'Девятилетний Энакин Скайуокер выигрывает Классик Бунта-Ив в Мос-Эспе. Квай-Гон выкупает его свободу у Уотто и увозит на Корусант.',
  },
  {
    id: 'battle-of-naboo',
    eraId: 'clone-wars',
    year: '32 ДБЯ',
    title: 'Битва при Набу',
    planetIds: ['naboo'],
    characterIds: ['padme', 'obi-wan', 'jar-jar'],
    summary:
      'Вторжение Торговой Федерации на Набу. Королева Амидала объединяет людей и гунганов, армия дроидов повержена, ситхи возвращаются в галактику.',
  },
  {
    id: 'kamino-clone-discovery',
    eraId: 'clone-wars',
    year: '22 ДБЯ',
    title: 'Открытие клонов Камино',
    planetIds: ['kamino'],
    characterIds: ['obi-wan', 'jango-fett', 'lama-su'],
    summary:
      'Оби-Ван Кеноби следует за отравителем на Камино и обнаруживает тайно выращенную армию клонов на базе шаблона Джанго Фетта. Начало Великой армии Республики.',
  },
  {
    id: 'battle-of-geonosis',
    eraId: 'clone-wars',
    year: '22 ДБЯ',
    title: 'Битва при Джеонозисе',
    planetIds: ['geonosis'],
    characterIds: ['yoda', 'mace', 'obi-wan', 'anakin', 'dooku', 'poggle', 'jango-fett'],
    summary:
      'Первое сражение Войн клонов. Мейс Винду обезглавливает Джанго Фетта, Йода приводит клонов, Дуку бежит с чертежами Звезды Смерти.',
  },
  {
    id: 'christophsis-ahsoka-debut',
    eraId: 'clone-wars',
    year: '22 ДБЯ',
    title: 'Битва при Кристофсисе',
    planetIds: ['christophsis'],
    characterIds: ['anakin', 'obi-wan', 'ahsoka'],
    summary:
      'Йода отправляет падавана Асоку Тано к Энакину в разгар осады Кристофсиса. Начало легендарного тандема «Малявка и Скайгай».',
  },
  {
    id: 'liberation-of-ryloth',
    eraId: 'clone-wars',
    year: '22 ДБЯ',
    title: 'Освобождение Райлота',
    planetIds: ['ryloth'],
    characterIds: ['mace', 'obi-wan', 'anakin', 'cham-syndulla'],
    summary:
      'Республика прорывает блокаду КНС над Райлотом. Мейс Винду высаживается на планету и объединяет войска с ополчением Чама Синдуллы «Свободный Райлот».',
  },
  {
    id: 'dathomir-genocide',
    eraId: 'clone-wars',
    year: '20 ДБЯ',
    title: 'Геноцид Ночных сестёр',
    planetIds: ['dathomir'],
    characterIds: ['dooku', 'grievous', 'talzin', 'ventress'],
    summary:
      'Дуку посылает Гривуса и армию дроидов на Датомир, чтобы уничтожить сестёр Талзин. Клан почти истреблён, Асажж Вентресс уходит в скитания.',
  },
  {
    id: 'battle-of-utapau',
    eraId: 'clone-wars',
    year: '19 ДБЯ',
    title: 'Битва при Утапау',
    planetIds: ['utapau'],
    characterIds: ['obi-wan', 'grievous', 'tion-medon'],
    summary:
      'Оби-Ван Кеноби настигает Генерала Гривуса в шахтах Пау-Сити и уничтожает последнего лидера КНС. Технически — конец Войн клонов.',
  },
  {
    id: 'duel-on-mustafar',
    eraId: 'clone-wars',
    year: '19 ДБЯ',
    title: 'Дуэль на Мустафаре',
    planetIds: ['mustafar'],
    characterIds: ['obi-wan', 'anakin', 'padme'],
    summary:
      'Оби-Ван настигает Энакина на добывающих платформах Мустафара. После проигранной дуэли изувеченного падавана забирает Палпатин — рождается Дарт Вейдер.',
  },
  {
    id: 'order-66',
    eraId: 'clone-wars',
    year: '19 ДБЯ',
    title: 'Приказ 66',
    planetIds: ['coruscant', 'kashyyyk', 'mandalore', 'felucia', 'mygeeto', 'utapau'],
    characterIds: ['palpatine', 'anakin', 'yoda', 'obi-wan', 'aayla', 'ki-adi-mundi', 'shaak-ti'],
    summary:
      'Одновременный удар клонов по джедаям на десятках фронтов. Айла Секура падает на Фелуции, Кай-Ади-Мунди — на Миджито, Йода бежит с Кашиика. Провозглашение Империи.',
  },

  // ============================================================
  // Эпоха Империи (19 ДБЯ – 4 ПБЯ)
  // ============================================================
  {
    id: 'vader-fortress',
    eraId: 'empire',
    year: '≈ 14 ДБЯ',
    title: 'Крепость Вейдера',
    planetIds: ['mustafar'],
    characterIds: ['anakin', 'palpatine'],
    summary:
      'На развалинах храма Момина Дарт Вейдер возводит обсидиановую цитадель. Мустафар становится личной вотчиной Тёмного лорда.',
  },
  {
    id: 'geonosis-sterilization',
    eraId: 'empire',
    year: '12 ДБЯ',
    title: 'Стерилизация Джеонозиса',
    planetIds: ['geonosis'],
    characterIds: ['poggle'],
    summary:
      'Империя тайно уничтожает всё население джеонозианцев, чтобы никто не рассказал о постройке Звезды Смерти. Поверхность планеты обугливается орбитальным огнём.',
  },
  {
    id: 'kessel-run',
    eraId: 'empire',
    year: '10 ДБЯ',
    title: 'Кессельский маршрут',
    planetIds: ['corellia'],
    characterIds: ['han', 'chewbacca', 'qira'],
    summary:
      'Кореллианец Хан Соло со свежеспасённым вуки Чубаккой на «Тысячелетнем соколе» проходит Кессельский маршрут за 12 парсеков. Ки’ра исчезает из его жизни в афере «Багровой Зари».',
  },
  {
    id: 'kamino-shutdown',
    eraId: 'empire',
    year: '≈ 18 ДБЯ',
    title: 'Закрытие клон-фабрик Камино',
    planetIds: ['kamino'],
    characterIds: ['lama-su', 'boba-fett'],
    summary:
      'Империя сворачивает клон-программу в пользу набора людей. Каминоанские лидеры казнены, платформы Тайпока-Сити разрушены имперским флотом.',
  },
  {
    id: 'purge-of-mandalore',
    eraId: 'empire',
    year: '≈ 5 ДБЯ',
    title: 'Великая чистка Мандалора',
    planetIds: ['mandalore'],
    characterIds: ['bo-katan', 'sabine'],
    summary:
      'Империя опустошает Мандалор, забирая запасы бескара. Стеклянные равнины — след орбитальных бомбардировок. Кланы уходят в подполье.',
  },
  {
    id: 'duel-on-tatooine',
    eraId: 'empire',
    year: '2 ДБЯ',
    title: 'Последняя дуэль Оби-Вана и Мола',
    planetIds: ['tatooine'],
    characterIds: ['obi-wan', 'maul', 'luke'],
    summary:
      'Мол выслеживает Кеноби у пустынь Татуина, стараясь добраться до Люка. Оби-Ван побеждает одним ударом — старый враг умирает у ног защитника Скайуокера.',
  },
  {
    id: 'ryloth-insurgency',
    eraId: 'empire',
    year: '≈ 3 ДБЯ',
    title: 'Сопротивление Райлота',
    planetIds: ['ryloth'],
    characterIds: ['cham-syndulla', 'hera-syndulla'],
    summary:
      'Чам Синдулла ведёт партизанскую войну против имперской оккупации. Его дочь Хера уходит собирать собственную повстанческую ячейку — будущих «Спектров».',
  },
  {
    id: 'mon-cala-uprising',
    eraId: 'empire',
    year: '≈ 2 ДБЯ',
    title: 'Восстание Мон-Калы',
    planetIds: ['mon-cala'],
    characterIds: ['ackbar', 'leia'],
    summary:
      'Мон-каламари под руководством Аккбара сбрасывают имперский протекторат. Их коралловые верфи начинают тайно строить крейсеры MC80 для Восстания.',
  },
  {
    id: 'battle-of-yavin',
    eraId: 'empire',
    year: '0 ПБЯ',
    title: 'Битва при Явине',
    planetIds: ['dantooine'],
    characterIds: ['luke', 'leia', 'han'],
    summary:
      'Уничтожение первой «Звезды Смерти». Точка отсчёта галактического календаря. Тарки́н уверял Лею, что взорвал Дантуин, но выбрал Альдераан.',
  },
  {
    id: 'battle-of-hoth',
    eraId: 'empire',
    year: '3 ПБЯ',
    title: 'Битва при Хоте',
    planetIds: ['hoth'],
    characterIds: ['luke', 'leia', 'han'],
    summary: 'Империя штурмует базу «Эхо». Дебют шагоходов AT-AT. Люк уходит на Дагобу к Йоде.',
  },
  {
    id: 'yoda-training-luke',
    eraId: 'empire',
    year: '3 ПБЯ',
    title: 'Обучение Люка на Дагобе',
    planetIds: ['dagobah'],
    characterIds: ['yoda', 'luke'],
    summary:
      'Йода принимает Люка Скайуокера и обучает его основам Силы. В пещере тёмной стороны Люк встречает видение Вейдера — с собственным лицом под шлемом.',
  },
  {
    id: 'battle-of-endor',
    eraId: 'empire',
    year: '4 ПБЯ',
    title: 'Битва при Эндоре',
    planetIds: ['endor'],
    characterIds: ['luke', 'leia', 'han', 'anakin', 'palpatine', 'ackbar', 'chewbacca'],
    summary:
      'Наземная команда Хана уничтожает щит-генератор с помощью эвоков, флот Аккбара разбивает имперскую армаду, Люк возвращает Вейдера к свету. Император повержен.',
  },

  // ============================================================
  // Новая Республика (4 – 28 ПБЯ)
  // ============================================================
  {
    id: 'return-of-mandalore',
    eraId: 'new-republic',
    year: '9 ПБЯ',
    title: 'Возрождение Мандалора',
    planetIds: ['mandalore'],
    characterIds: ['din-djarin', 'bo-katan'],
    summary:
      'Дин Джарин передаёт Тёмный клинок Бо-Катан. Кланы объединяются, живые воды под руинами Мандалора вновь принимают паломников.',
  },

  // ============================================================
  // Эпоха Первого Ордена (28 – 35 ПБЯ)
  // ============================================================
  {
    id: 'starkiller-base',
    eraId: 'first-order',
    year: '34 ПБЯ',
    title: 'Старкиллер-База: гибель Илума',
    planetIds: ['ilum'],
    characterIds: ['han', 'chewbacca', 'snoke'],
    summary:
      'Первый Орден заканчивает превращение выпотрошенного Илума в суперлазер. Финн, Рей и Чубакка уничтожают базу — планета-святыня джедаев разваливается на осколки.',
  },
  {
    id: 'battle-of-exegol',
    eraId: 'first-order',
    year: '35 ПБЯ',
    title: 'Битва при Экзеголе',
    planetIds: ['exegol'],
    characterIds: ['leia', 'luke', 'palpatine', 'snoke'],
    summary:
      'Скрытый флот «Ситх-Этёрнал» стартует из грозовых бурь Экзегола. Объединённое Сопротивление и последние джедаи Скайуокеров окончательно уничтожают клонированного Палпатина.',
  },
];
