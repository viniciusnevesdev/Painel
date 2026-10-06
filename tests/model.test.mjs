import test from 'node:test';import assert from 'node:assert/strict';import {noteVisible,noteValid,nextMidnight,parseTimes,parseBefore,parts} from '../model.js';
const note={repeat:'weekly',days:[1,3,5],times:[],starts:null,ends:null};
test('recorrência respeita São Paulo e não horário UTC',()=>{const t=new Date('2026-10-06T01:00:00Z');assert.equal(parts(t).weekday,1);assert.equal(noteVisible(note,t),true)});
test('ocultar só a ocorrência; volta no próximo dia válido',()=>{const monday=new Date('2026-10-05T15:00:00Z');const n={...note,hiddenUntil:nextMidnight(monday)};assert.equal(noteVisible(n,monday),false);assert.equal(noteVisible(n,new Date('2026-10-07T15:00:00Z')),true)});
test('lixeira e validade não criam obrigações',()=>{assert.equal(noteValid({...note,deletedAt:'2026-10-05'},new Date('2026-10-05T15:00:00Z')),false);assert.equal(noteValid({...note,ends:'2026-10-05T15:00:00Z'},new Date('2026-10-05T15:00:00Z')),false)});
test('valida e elimina avisos repetidos',()=>{assert.deepEqual(parseTimes('15:00, 12:00, 15:00'),['12:00','15:00']);assert.throws(()=>parseTimes('25:00'));assert.deepEqual(parseBefore('120,30,30'),[30,120]);assert.throws(()=>parseBefore('-5'))});
