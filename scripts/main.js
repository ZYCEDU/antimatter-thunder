// Mindustry v160.5. A line-piercing power turret with optional liquid ammunition modifiers.
const range = 70 * Vars.tilesize;
const shotInterval = 60;
const waterPerShot = 4;
const cryofluidPerShot = 3;

function makeBeam(damage, reloadMultiplier, outer, core, width){
    const beam = new LaserBulletType(damage);
    beam.length = range;
    beam.width = width;
    beam.lifetime = 18;
    beam.colors = [Color.valueOf(outer), Color.valueOf(core), Color.white];
    beam.hitColor = Color.valueOf(core);
    beam.reloadMultiplier = reloadMultiplier;
    beam.pierceCap = -1;
    beam.pierceDamageFactor = 0;
    beam.laserAbsorb = false;
    beam.absorbable = false;
    beam.buildingDamageMultiplier = 0.5;
    beam.collidesAir = true;
    beam.collidesGround = true;
    beam.collidesTiles = true;
    beam.laserEffect = Fx.none;
    beam.sideAngle = 35;
    beam.sideLength = 32;
    return beam;
}

const dryBeam = makeBeam(100, 1, "7948fa66", "c29dff", 15);
const waterBeam = makeBeam(200, 1.5, "4375ff66", "72d6ff", 18);
const cryoBeam = makeBeam(300, 2, "29e4d866", "8cfff5", 21);

const cannon = new PowerTurret("antimatter-thunder");
cannon.localizedName = "反物质雷光炮塔";
cannon.description = "消耗1电力/秒，向70格内的敌人发射穿透雷光，对建筑只造成一半伤害。无需弹药；供水或冷却液可提升单发伤害与开火频率。";
cannon.details = "无液体：100伤害/发，每秒1发。水：200伤害/发，每秒1.5发，消耗4水/发。冷却液：300伤害/发，每秒2发，消耗3冷却液/发。满电连续命中时，对单位理论伤害为100、300、600/秒，对建筑为50、150、300/秒。两种液体强化不叠加，优先使用冷却液。";
cannon.category = Category.turret;
cannon.buildVisibility = BuildVisibility.shown;
cannon.requirements = [new ItemStack(Items.copper, 400), new ItemStack(Items.lead, 400),
    new ItemStack(Items.titanium, 400), new ItemStack(Items.thorium, 400)];
cannon.alwaysUnlocked = true;
cannon.health = 3000;
cannon.size = 2;
cannon.buildTime = 300; // 300 ticks = 5 seconds of base construction time.
cannon.buildCostMultiplier = 1;
cannon.range = range;
cannon.trackingRange = range;
cannon.reload = shotInterval;
cannon.shootType = dryBeam;
cannon.shootY = 0; // Measure beam length from the turret center.
cannon.inaccuracy = 0;
cannon.shootCone = 2;
cannon.rotateSpeed = 12;
cannon.recoil = 1.2;
cannon.targetAir = true;
cannon.targetGround = true;
cannon.targetBlocks = true;
cannon.targetUnderBlocks = true;
cannon.predictTarget = false;
cannon.canOverdrive = false;
cannon.fogRadiusMultiplier = 0.08;
cannon.hasItems = false;
cannon.hasLiquids = true;
cannon.liquidCapacity = 36;
cannon.consumeAmmoOnce = true;
cannon.shootSound = Sounds.shootLancer;
cannon.shootSoundVolume = 0.6;
cannon.heatColor = Color.valueOf("bb8bff");
cannon.consumePower(1 / 60);

cannon.buildType = prov(function(){
    return extend(PowerTurret.PowerTurretBuild, cannon, {
        peekAmmo: function(){
            if(this.liquids != null){
                if(this.liquids.get(Liquids.cryofluid) >= cryofluidPerShot) return cryoBeam;
                if(this.liquids.get(Liquids.water) >= waterPerShot) return waterBeam;
            }
            return dryBeam;
        },
        useAmmo: function(){
            const beam = this.peekAmmo();
            if(beam === cryoBeam || beam.equals(cryoBeam)) this.liquids.remove(Liquids.cryofluid, cryofluidPerShot);
            else if(beam === waterBeam || beam.equals(waterBeam)) this.liquids.remove(Liquids.water, waterPerShot);
            return beam;
        },
        acceptLiquid: function(source, liquid){
            return liquid != null && (liquid.id === Liquids.water.id || liquid.id === Liquids.cryofluid.id);
        }
    });
});
