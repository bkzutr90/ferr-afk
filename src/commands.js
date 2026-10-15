const { SlashCommandBuilder, ChannelType, MessageFlags, PermissionFlagsBits } = require('discord.js');
const { setAfk, stopAfk, statusOf, setLogChannel, getLogChannel } = require('./voice');

const EPHEMERAL = MessageFlags.Ephemeral;

const commands = new Map();
const def = (data, execute) => commands.set(data.name, { data, execute });

// ------------------------------------------------------------------ /afk (voice 24/7)
def(
  new SlashCommandBuilder()
    .setName('afk')
    .setDescription('Atur bot AFK di voice channel 24/7')
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild)
    .setContexts(0) // hanya di server (bukan DM)
    .addSubcommand((s) =>
      s
        .setName('join')
        .setDescription('Bot masuk ke voice channel dan menjaganya terus (auto-rejoin)')
        .addChannelOption((o) =>
          o.setName('channel').setDescription('Voice channel (kosong = channel voice kamu)').addChannelTypes(ChannelType.GuildVoice, ChannelType.GuildStageVoice)
        )
    )
    .addSubcommand((s) => s.setName('leave').setDescription('Keluarkan bot dari voice dan matikan mode AFK'))
    .addSubcommand((s) => s.setName('status').setDescription('Lihat status koneksi voice bot'))
    .addSubcommand((s) =>
      s
        .setName('log')
        .setDescription('Atur channel notifikasi status bot (terputus / masuk lagi). Kosong = matikan')
        .addChannelOption((o) =>
          o.setName('channel').setDescription('Channel teks untuk notifikasi').addChannelTypes(ChannelType.GuildText, ChannelType.GuildAnnouncement)
        )
    ),
  async (i) => {
    if (!i.guildId) return i.reply({ content: '❌ Command ini hanya bisa dipakai di server.', flags: EPHEMERAL });
    const sub = i.options.getSubcommand();

    if (sub === 'join') {
      const channel = i.options.getChannel('channel') || i.member?.voice?.channel;
      if (!channel) return i.reply({ content: '❌ Pilih voice channel, atau masuk ke voice dulu.', flags: EPHEMERAL });
      await i.deferReply({ flags: EPHEMERAL });
      try {
        await setAfk(i.guildId, channel.id);
        return i.editReply(`✅ Bot AFK di **${channel.name}**. Kalau terputus, bot masuk lagi otomatis (dicek tiap 30 detik).`);
      } catch (err) {
        return i.editReply(`❌ Gagal masuk: \`${String(err.message).slice(0, 200)}\``);
      }
    }

    if (sub === 'leave') {
      stopAfk(i.guildId);
      return i.reply({ content: '👋 Bot keluar dari voice. Mode AFK dimatikan.', flags: EPHEMERAL });
    }

    if (sub === 'log') {
      const channel = i.options.getChannel('channel');
      if (!channel) {
        setLogChannel(i.guildId, null);
        return i.reply({ content: '🔕 Notifikasi dimatikan.', flags: EPHEMERAL });
      }
      const perms = channel.permissionsFor(i.guild.members.me);
      if (!perms?.has(['ViewChannel', 'SendMessages', 'EmbedLinks'])) {
        return i.reply({ content: `❌ Bot butuh izin View Channel, Send Messages, dan Embed Links di ${channel}.`, flags: EPHEMERAL });
      }
      setLogChannel(i.guildId, channel.id);
      return i.reply({ content: `✅ Notifikasi status bot akan dikirim ke ${channel}.`, flags: EPHEMERAL });
    }

    // status
    const st = statusOf(i.guildId);
    const log = getLogChannel(i.guildId);
    return i.reply({
      content:
        (st.channelId ? `🎧 Menjaga <#${st.channelId}> • status: **${st.state}**` : 'Mode AFK tidak aktif. Pakai `/afk join`.') +
        `\n📣 Channel log: ${log ? `<#${log}>` : 'belum diatur (`/afk log`)'}`,
      flags: EPHEMERAL,
    });
  }
);

module.exports = { commands };
